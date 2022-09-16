import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import userEvent from "@testing-library/user-event"; 

import Calendar from "./Calendar";

let container = null;
beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
});

afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
});

it("has current year and month selected", () => {
    render(<Calendar />, container);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const yearSelect = container.querySelector(".switcher > select");
    expect(yearSelect.value).toBe(`${year}`);

    const monthSelect = container.querySelectorAll(".switcher > select")[1]
    expect(monthSelect.value).toBe(`${month}`);
});

it("has the right number of days in each month of 2022", () => {
    const daysInMonths2022 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30 ,31];

    render(<Calendar />, container);

    const yearSelect = container.querySelector(".switcher > select");
    const monthSelect = container.querySelectorAll(".switcher > select")[1]

    userEvent.selectOptions(yearSelect, ["2022"]);
    daysInMonths2022.forEach((daysInMonth, i) => {
        userEvent.selectOptions(monthSelect, ["" + (i + 1)]);

        const days = container.querySelectorAll('.cell.day');
        expect(days.length).toBe(daysInMonth);
    })
});
