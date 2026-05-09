const MODAL_IMAGES = [
  // Ramki wspólne (LoginForm, UserPanel, SettingsPanel)
  '/images/frameSettings.webp',
  '/images/TLframeSettings.svg',
  '/images/TRframeSettings.svg',
  '/images/LBframeSettings.svg',
  '/images/RBframeSettings.svg',

  // CharacterSelect modal
  '/images/LRChooseCharacter.webp',
  '/images/TBFrameChooseCharacter.webp',
  '/images/frameMainChooseCharacter.webp',
  '/images/bgTitleChooseCharacterModal.svg',
  '/images/chooseChar.svg',

  // AppearanceModal (zmiana kostiumu)
  '/images/bgChangeCostume.svg',
  '/images/lrFrameChangeCostume.webp',
  '/images/tbFrameChangeCostume.svg',

  // ChangeNick modal
  '/images/bgChangeNick.webp',
  '/images/lrFrameChangeNick.webp',
  '/images/tbFrameChangeNick.webp',
  '/images/textFieldChangeNick.webp',
  '/images/btnChangeNick.webp',
  '/images/closeChangeNick.webp',
  '/images/textFieldModal.webp',

  // DeleteChar modal
  '/images/bgDeleteChar.webp',
  '/images/lrFrameDeleteChar.webp',
  '/images/tbFrameDeleteChar.webp',
  '/images/btnCancelDeleteChar.webp',
  '/images/btnConfirmDeleteChar.webp',

  // GenderRace modal
  '/images/bgGenderRace.webp',
  '/images/lrFrameGenderRace.webp',
  '/images/tbFrameGenderRace.webp',
  '/images/bgTitleGenderRace.webp',
  '/images/btnGenderRace.webp',
  '/images/bgCheckboxGenderRace.svg',
  '/images/checkmarkGenderRace.webp',

  // RegisterForm
  '/images/bgRegister.webp',
  '/images/lrFrameRegister.webp',
  '/images/tbFrameRegister.webp',
  '/images/btnRegister.webp',
  '/images/textFieldRegister.webp',
  '/images/bgTitleRegister.webp',
  '/images/corner-TL.svg',
  '/images/corner TR.svg',
  '/images/corner-BR.svg',
  '/images/corner BL.svg',

  // CharacterCard / CharacterManagement
  '/images/bgFrameCharacter.webp',
  '/images/bgCharacterAvatar.webp',
  '/images/backgroundCharacter.svg',
  '/images/activeCharacter.svg',
  '/images/emptyCharacter.svg',
  '/images/characterManagementBtn.webp',
  '/images/accountAndCreateCharacterBtn.webp',
  '/images/btnCharacterManagement.webp',
  '/images/innerFrameHorizontal.webp',
  '/images/innerFrameVertical.webp',
  '/images/bgCheckboxCharMgmt.webp',
  '/images/checkmarkCharMgmt.webp',
  '/images/checkmark.webp',
  '/images/bgCheckboxCreateChar.webp',

  // AccountSettings
  '/images/bgAccountFull.webp',
  '/images/accountLongBtn.webp',
  '/images/accountShortBtn.webp',
  '/images/accountTextField.webp',
  '/images/logout.webp',

  // CharacterCreation
  '/images/topFrameCreateChar.webp',
  '/images/botomFrameCreateChar.webp',
  '/images/leftFrameCreateChar.webp',
  '/images/rightFrameCreateChar.webp',

  // GameLoadingScreen
  '/images/bgLoading.webp',
  '/images/barFull2.svg',

  // Inne
  '/images/joinToGame.svg',
  '/images/button.webp',
  '/images/inputLogin.webp',
];

export function preloadModalImages(): void {
  if (typeof window === 'undefined') return;

  const run = () => {
    for (const src of MODAL_IMAGES) {
      const img = new Image();
      img.src = src;
    }
  };

  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void })
      .requestIdleCallback(run);
  } else {
    setTimeout(run, 200);
  }
}
