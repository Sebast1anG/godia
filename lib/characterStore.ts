import { Character, db } from "@/lib/db";
import {
  characterRowId,
  createGameCharacter,
  deleteGameCharacter,
  fromApiClass,
  GameApiCharacter,
  gameApiEnabled,
  listGameCharacters,
  toApiClass,
} from "@/lib/gameApi";

// Where characters are kept: on the game server when GAME_API_URL is set, otherwise in the website's own database.
//
// The game server does not know a character's level, server or dates, so with it switched on the website's
// `characters` table keeps just those, in a row with the same id.
//
// That row is also what makes a character visible: the game server cannot delete anything yet, so a character
// whose row was removed (e.g. in the CMS) is treated as deleted and neither listed nor playable.

type NewCharacter = Omit<Character, 'id' | 'created_at' | 'level' | 'last_online'>;

const withLocalDetails = (character: GameApiCharacter, local: Character): Character => ({
  id: String(character.id),
  user_id: character.userId,
  name: character.name,
  class: fromApiClass(character.class),
  game_mode: character.gameMode as Character['game_mode'],
  gender: character.gender as Character['gender'],
  race: character.race as Character['race'],
  server_id: local.server_id,
  level: local.level,
  last_online: local.last_online,
  created_at: local.created_at,
});

const newestFirst = (a: Character, b: Character) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

export const characterStore = {
  /** The game server cannot change a character yet. */
  canEdit: (): boolean => !gameApiEnabled(),

  /** Newest first. */
  list: async (userId: string): Promise<Character[]> => {
    if (!gameApiEnabled()) return db.findCharactersByUserId(userId);

    const [characters, localRows] = await Promise.all([listGameCharacters(userId), db.findCharactersByUserId(userId)]);
    const local = new Map(localRows.map((row) => [row.id, row]));
    return characters
      .flatMap((character) => {
        const row = local.get(characterRowId(character.id));
        return row ? [withLocalDetails(character, row)] : [];
      })
      .sort(newestFirst);
  },

  /** Null when the character does not exist or belongs to someone else. */
  find: async (userId: string, characterId: string): Promise<Character | null> => {
    if (!gameApiEnabled()) {
      const character = await db.findCharacterById(characterId);
      return character && character.user_id === userId ? character : null;
    }
    const characters = await characterStore.list(userId);
    return characters.find((character) => character.id === characterId) ?? null;
  },

  /** Removes the character from the game server first, so a failure there leaves the website row in place. */
  delete: async (userId: string, characterId: string): Promise<void> => {
    // Against a game server without the delete endpoint this still hides the character, see the note on top.
    if (!gameApiEnabled()) {
      await db.deleteCharacter(characterId);
      return;
    }
    await deleteGameCharacter(userId, characterId);
    await db.deleteCharacter(characterRowId(characterId));
  },

  create: async (character: NewCharacter): Promise<Character> => {
    if (!gameApiEnabled()) return db.createCharacter(character);

    const created = await createGameCharacter(character.user_id, {
      name: character.name,
      class: toApiClass(character.class),
      race: character.race,
      gender: character.gender,
      gameMode: character.game_mode,
    });
    try {
      const local = await db.createCharacter(character, characterRowId(created.id));
      return withLocalDetails(created, local);
    } catch (error) {
      // A character only the game server knows about stays invisible here and keeps its name taken.
      await deleteGameCharacter(character.user_id, String(created.id)).catch(() => undefined);
      throw error;
    }
  },
};
