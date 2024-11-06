export const ActionType = {
    SHOW_POPULAR_SITUATIONS: "showPopularSituations",
    // Сюда можно добавлять другие типы действий по мере необходимости
} as const;

// Создаем тип на основе значений объекта
export default ActionType;