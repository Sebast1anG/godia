import { Character, db } from "@/lib/db";
import {
  createGameCharacter,
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

type NewCharacter = Omit<Character, 'id' | 'created_at' | 'level' | 'last_online'>;

const withLocalDetails = (character: GameApiCharacter, local: Character | undefined): Character => ({
  id: String(character.id),
  user_id: character.userId,
  name: character.name,
  class: fromApiClass(character.class),
  game_mode: character.gameMode as Character['game_mode'],
  gender: character.gender as Character['gender'],
  race: character.race as Character['race'],
  server_id: local?.server_id ?? 0,
  level: local?.level ?? 1,
  last_online: local?.last_online ?? null,
  // Missing for a character the website did not create; the epoch sorts it last.
  created_at: local?.created_at ?? new Date(0),
});

const newestFirst = (a: Character, b: Character) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

export const characterStore = {
  /** The game server cannot change or remove a character yet. */
  canEdit: (): boolean => !gameApiEnabled(),

  /** Newest first. */
  list: async (userId: string): Promise<Character[]> => {
    if (!gameApiEnabled()) return db.findCharactersByUserId(userId);

    const [characters, localRows] = await Promise.all([listGameCharacters(userId), db.findCharactersByUserId(userId)]);
    const local = new Map(localRows.map((row) => [row.id, row]));
    return characters.map((character) => withLocalDetails(character, local.get(String(character.id)))).sort(newestFirst);
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

  create: async (character: NewCharacter): Promise<Character> => {
    if (!gameApiEnabled()) return db.createCharacter(character);

    const created = await createGameCharacter(character.user_id, {
      name: character.name,
      class: toApiClass(character.class),
      race: character.race,
      gender: character.gender,
      gameMode: character.game_mode,
    });
    const local = await db.createCharacter(character, String(created.id));
    return withLocalDetails(created, local);
  },
};
