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

    const {container} = render(<Calendar />);

    const selects = screen.getAllByRole("combobox");
    const yearSelect = selects[0];
    const monthSelect = selects[1];

    userEvent.selectOptions(yearSelect, ["2022"]);
    daysInMonths2022.forEach((daysInMonth, i) => {
        userEvent.selectOptions(monthSelect, ["" + (i + 1)]);

        const days = container.querySelectorAll('.cell.day');
        expect(days.length).toBe(daysInMonth);
    })
});
