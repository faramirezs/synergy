export const settings = {
    visBord: false,
    showMass: false,
    continuity: false,
    roundFood: true,
    darkMode: false,

    toggleBorder: function () {
        settings.visBord = !settings.visBord;
    },
    toggleMass: function () {
        settings.showMass = !settings.showMass;
    },
    toggleContinuity: function () {
        settings.continuity = !settings.continuity;
    },
    toggleRoundFood: function () {
        settings.roundFood = !settings.roundFood;
    },
    toggleDarkMode: function () {
        settings.darkMode = !settings.darkMode;
        // You can add logic here to apply the dark mode theme
    }
};
