import {render, cleanup, screen} from '@testing-library/react'
import userEvent from "@testing-library/user-event"; 
import Calendar from "./Calendar";

afterEach(cleanup);

it("has current year and month selected", () => {
    render(<Calendar />);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const selects = screen.getAllByRole("combobox");
    const yearSelect = selects[0];
    const monthSelect = selects[1];

    expect(yearSelect.value).toBe(`${year}`);
    expect(monthSelect.value).toBe(`${month}`);
});

it("has the right number of days in each month of 2022", () => {
    const daysInMonths2022 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30 ,31];

    render(<Calendar />);

    const { yearSelect, monthSelect } = getSelects();

    userEvent.selectOptions(yearSelect, ["2022"]);
    daysInMonths2022.forEach((daysInMonth, monthIndex) => {
        userEvent.selectOptions(monthSelect, ["" + (monthIndex + 1)]);

        const days = getAllDays();
        expect(days).toHaveLength(daysInMonth);
    })
});

it("has the right weekends in each month of 2022", () => {
    const weekendsInMonths2022 = [
        [1,2, 8,9, 15,16, 22,23, 29,30], // January
        [5,6, 12,13, 19,20, 26,27],      // February
        [5,6, 12,13, 19,20, 26,27],      // March
        [2,3, 9,10, 16,17, 23,24, 30],   // April
        [1, 7,8, 14,15, 21,22, 28,29],   // May
        [4,5, 11,12, 18,19, 25,26],      // June
        [2,3, 9,10, 16,17, 23,24, 30,31],// July
        [6,7, 13,14, 20,21, 27,28],      // August
        [3,4, 10,11, 17,18, 24,25],      // September
        [1,2, 8,9, 15,16, 22,23, 29,30], // October
        [5,6, 12,13, 19,20, 26,27],      // November
        [3,4, 10,11, 17,18, 24,25, 31],  // December
    ];

    render(<Calendar />);

    const { yearSelect, monthSelect } = getSelects();

    userEvent.selectOptions(yearSelect, ["2022"]);
    weekendsInMonths2022.forEach((weekendsInMonth, monthIndex) => {
        userEvent.selectOptions(monthSelect, ["" + (monthIndex + 1)]);

        const days = getAllDays();
        const weekends = [];
        for (let i = 0; i < days.length; i++) {
            const day = days[i];
            if (day.classList.contains("weekend")) {
                weekends.push(day);
            }
        }

        expect(weekends).toHaveLength(weekendsInMonth.length);

        for (let i = 0; i < weekends.length; i++) {
            expect(parseInt(weekends[i].textContent)).toBe(weekendsInMonth[i]);    
        }
    })
});

function getSelects() {
    const selects = screen.getAllByRole("combobox");
    const yearSelect = selects[0];
    const monthSelect = selects[1];
    return { yearSelect, monthSelect };
}

function getAllDays() {
    return screen.getAllByRole("button", {name: /(\d+)/i});
}
