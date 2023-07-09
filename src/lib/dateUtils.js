export function getNextDate(today) {
    const lastDateOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const lastDateOfYear = new Date(today.getFullYear() + 1, 0, 0);
    const isLastDateOfMonth = today.getDate() === lastDateOfMonth.getDate();
    const isLastDateOfYear = today.getDate() === lastDateOfYear.getDate();
  
    let nextDay = isLastDateOfMonth || isLastDateOfYear ? 1 : today.getDate() + 1;
    let nextMonth = isLastDateOfMonth ? today.getMonth() + 2 : today.getMonth() + 1;
    nextMonth = nextMonth === 13 ? 1 : nextMonth;
    let nextYear = isLastDateOfYear ? today.getFullYear() + 1 : today.getFullYear();
  
    const nextDate = new Date(nextYear, nextMonth - 1, nextDay);
  
    const year = String(nextDate.getFullYear());
    const month = String(nextDate.getMonth() + 1).padStart(2, '0');
    const day = String(nextDate.getDate()).padStart(2, '0');
  
    const formattedDate = `${year}-${month}-${day}`;
  
    return {
      nextDate,
      formattedDate,
    };
  }