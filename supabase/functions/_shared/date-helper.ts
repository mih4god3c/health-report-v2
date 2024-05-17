export const getStartOfWeek = () => {
    const today = new Date();
    const diff = today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1);

    return new Date(today.setDate(diff));
};

export const getEndOfWeek = () => {
    const today = new Date();
    const end = today.getDate() + (7 - today.getDay());

    return new Date(today.setDate(end));
};
