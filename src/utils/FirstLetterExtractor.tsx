export const getInitialsLetters = (name: string): string => {
    const names = name.split(' '); // Split the name into parts (first name and last name)
    if (names?.length < 2) return ''; // If there's no last name, return an empty string

    const firstNameInitial = names[0][0].toUpperCase(); // First letter of the first name
    const lastNameInitial = names[1][0].toUpperCase(); // First letter of the last name

    return `${firstNameInitial}${lastNameInitial}`; // Use template literals correctly
};