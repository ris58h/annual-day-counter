import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Day({ value, selected }) {
    return (
        <button className={'day' + (selected ? ' selected' : '')} data-day={value}>
            {value}
        </button>
    );
}

function Month({ year, month, selectedDaysInMonth, onDaySelection }) {
    const [pointedRange, setPointedRange] = useState();

    const daysBefore = ((new Date(year, month - 1).getDay() - 1) + 7) % 7;
    const daysInMonth = new Date(year, month - 1, 0).getDate();
    const weeksInMonth = Math.ceil((daysBefore + daysInMonth) / 7);
    const weeks = [];
    let days = [];
    for (let i = 1; i <= weeksInMonth * 7; i++) {
        const day = (i <= daysBefore || i > daysBefore + daysInMonth)
            ? renderEmptyDay(i)
            : renderDay(i - daysBefore, i);
        days.push(day);
        if (days.length === 7) {
            weeks.push(renderWeek(days, i));
            days = [];
        }
    }

    return (
        <div className='month'>
            <div className='week'>
                <div className='day'>Mon</div>
                <div className='day'>Tue</div>
                <div className='day'>Wed</div>
                <div className='day'>Thu</div>
                <div className='day'>Fri</div>
                <div className='day'>Sat</div>
                <div className='day'>Sun</div>
            </div>
            <div className='weeks'
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
                {weeks}
            </div>
        </div>
    );

    function renderDay(day, key) {
        let selected;
        const inPointedRange = pointedRange && Math.min(pointedRange.from, pointedRange.to) <= day && day <= Math.max(pointedRange.from, pointedRange.to);
        if (inPointedRange) {
            selected = pointedRange.selected;
        } else {
            selected = selectedDaysInMonth?.has(day);
        }
        return (
            <Day
                key={key}
                value={day}
                selected={selected}
            />
        );
    }

    function handlePointerDown(e) {
        e.currentTarget.setPointerCapture(e.pointerId);

        const day = parseInt(e.target.dataset.day);
        if (!day) {
            return;
        }
        setPointedRange({
            from: day,
            to: day,
            selected: !selectedDaysInMonth?.has(day)
        });
    }

    function handlePointerMove(e) {
        if (!pointedRange) {
            return;
        }
        var target = document.elementFromPoint(e.clientX, e.clientY);
        const day = parseInt(target.dataset.day);
        if (!day) {
            return;
        }
        if (pointedRange.to === day) {
            return;
        }
        setPointedRange({
            from: pointedRange.from,
            to: day,
            selected: pointedRange.selected
        });
    }

    function handlePointerUp() {
        if (!pointedRange) {
            return;
        }
        const days = [];
        for (let i = Math.min(pointedRange.from, pointedRange.to); i <= Math.max(pointedRange.from, pointedRange.to); i++) {
            days.push(i);
        }
        if (days.length === 0) {
            return;
        }
        setPointedRange();
        onDaySelection(days, pointedRange.selected);
    }

    function renderEmptyDay(key) {
        return (
            <div className='day' key={key} />
        );
    }

    function renderWeek(days, key) {
        return (
            <div className='week' key={key}>
                {days}
            </div>
        );
    }
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function MonthSwitcher({ month, selectedDaysInYear, onPrevMonth, onNextMonth, onMonthChange }) {
    const months = MONTH_NAMES.map((name, index) => {
        const monthNumber = index + 1;
        return <option value={monthNumber} key={monthNumber}>{name} ({countSelectedDays(monthNumber)})</option>
    });

    return (
        <div className='switcher'>
            <button onClick={onPrevMonth}>{'<'}</button>
            <select value={month} onChange={handleOnChange}>
                {months}
            </select>
            <button onClick={onNextMonth}>{'>'}</button>
        </div>
    );

    function handleOnChange(event) {
        onMonthChange(parseInt(event.target.value));
    }

    function countSelectedDays(month) {
        if (!selectedDaysInYear) {
            return 0;
        }
        const selectedDaysInMonth = selectedDaysInYear.get(month);
        if (!selectedDaysInMonth) {
            return 0;
        } else {
            return selectedDaysInMonth.size;
        }
    }
}

const YEAR_GAP = 4;

function YearSwitcher({ year, selectedDays, onPrevYear, onNextYear, onYearChange }) {
    const years = [];
    const prevPageYear = year - YEAR_GAP - 1;
    years.push(
        <option value={prevPageYear} key={prevPageYear}>...</option>
    );
    for (let i = year - YEAR_GAP; i <= year + YEAR_GAP; i++) {
        years.push(
            <option value={i} key={i}>{i} ({countSelectedDays(i)})</option>
        );
    }
    const nextPageYear = year + YEAR_GAP + 1;
    years.push(
        <option value={nextPageYear} key={nextPageYear}>...</option>
    );

    return (
        <div className='switcher'>
            <button onClick={onPrevYear}>{'<'}</button>
            <select value={year} onChange={handleOnChange}>
                {years}
            </select>
            <button onClick={onNextYear}>{'>'}</button>
        </div>
    );

    function handleOnChange(event) {
        onYearChange(parseInt(event.target.value));
    }

    function countSelectedDays(year) {
        if (!selectedDays) {
            return 0;
        }
        const selectedDaysInYear = selectedDays.get(year);
        if (!selectedDaysInYear) {
            return 0;
        }
        let res = 0;
        for (let selectedDaysInMonth of selectedDaysInYear.values()) {
            res += selectedDaysInMonth.size;
        }
        return res;
    }
}

function Calendar() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [selectedDays, setSelectedDays] = useLocalStorage('selectedDays', new Map(), serializeSelectedDates, deserializeSelectedDates);

    return (
        <div className='calendar'>
            <YearSwitcher
                year={year}
                selectedDays={selectedDays}
                onPrevYear={() => setYear(year - 1)}
                onNextYear={() => setYear(year + 1)}
                onYearChange={setYear}
            />
            <MonthSwitcher
                month={month}
                selectedDaysInYear={selectedDays.get(year)}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onMonthChange={setMonth}
            />
            <Month
                year={year}
                month={month}
                selectedDaysInMonth={selectedDays.get(year)?.get(month)}
                onDaySelection={handleDaySelection}
            />
        </div>
    );

    function handleDaySelection(days, selected) {
        const newSelectedDays = new Map(selectedDays);

        const yearSelectedDays = new Map(newSelectedDays.get(year));
        newSelectedDays.set(year, yearSelectedDays);

        const monthSelectedDays = new Set(yearSelectedDays.get(month));
        yearSelectedDays.set(month, monthSelectedDays);

        days.forEach(day => {
            if (selected) {
                monthSelectedDays.add(day);
            } else {
                monthSelectedDays.delete(day);
            }
        });

        setSelectedDays(newSelectedDays);
    }

    function handlePrevMonth() {
        if (month === 1) {
            setYear(year - 1);
            setMonth(12);
        } else {
            setMonth(month - 1);
        }
    }

    function handleNextMonth() {
        if (month === 12) {
            setYear(year + 1);
            setMonth(1);
        } else {
            setMonth(month + 1);
        }
    }
}

function useLocalStorage(key, initialValue, serialize = JSON.stringify, deserialize = JSON.parse) {
    const [storedValue, setStoredValue] = useState(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? deserialize(item) : initialValue;
        } catch (error) {
            console.log(error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, serialize(valueToStore));
            }
        } catch (error) {
            console.log(error);
        }
    };

    return [storedValue, setValue];
}

function serializeSelectedDates(selectedDays) {
    const res = {};
    selectedDays.forEach((monthsMap, year) => {
        const monthsObject = {};
        monthsMap.forEach((daysSet, month) => {
            const daysArray = Array.from(daysSet);
            monthsObject[month] = daysArray;
        })
        res[year] = monthsObject;
    });
    return JSON.stringify(res);
}

function deserializeSelectedDates(string) {
    const object = JSON.parse(string);
    const res = new Map();
    for (const [yearString, monthsObject] of Object.entries(object)) {
        const year = parseInt(yearString);
        const monthsMap = new Map();
        for (const [monthString, daysArray] of Object.entries(monthsObject)) {
            const month = parseInt(monthString);
            const daysSet = new Set();
            daysArray.forEach((d) => daysSet.add(d));
            monthsMap.set(month, daysSet);
        }
        res.set(year, monthsMap);
    }
    return res;
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Calendar />);
