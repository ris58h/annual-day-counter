import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Day({value, selected, onClick}) {
    return (
        <button className={'day' + (selected ? ' selected' : '')} onClick={onClick}>
            {value}
        </button>
    );
}

function Month({year, month, selectedDaysInMonth, onDayClick}) {
    function renderDay(day, key) {
        const selected = selectedDaysInMonth?.has(day);

        return (
            <Day
                key={key}
                value={day}
                selected={selected}
                onClick={() => onDayClick(day)}
            />
        );
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

    const daysBefore = ((new Date(year, month).getDay() - 1) + 7) % 7;
    const daysInMonth = new Date(year, month, 0).getDate();
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
            {weeks}
        </div>
    );
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function MonthSwitcher({month, selectedDaysInYear, onPrevMonth, onNextMonth, onMonthChange}) {
    const months = MONTH_NAMES.map((name, index) => {
        return <option value={index} key={index}>{name} ({countSelectedDays(index)})</option>
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

function YearSwitcher({year, selectedDays, onPrevYear, onNextYear, onYearChange}) {
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
    const [month, setMonth] = useState(now.getMonth());
    const [selectedDays, setSelectedDays] = useState(new Map());

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
                onDayClick={handleDayClick}
            />
        </div>
    );

    function handleDayClick(day) {
        const newSelectedDays = new Map(selectedDays);

        const yearSelectedDays = new Map(newSelectedDays.get(year));
        newSelectedDays.set(year, yearSelectedDays);

        const monthSelectedDays = new Set(yearSelectedDays.get(month));
        yearSelectedDays.set(month, monthSelectedDays);

        if (monthSelectedDays.has(day)) {
            monthSelectedDays.delete(day);
        } else {
            monthSelectedDays.add(day);
        }

        setSelectedDays(newSelectedDays);
    }

    function handlePrevMonth() {
        if (month === 0) {
            setYear(year - 1);
            setMonth(11);
        } else {
            setMonth(month - 1);
        }
    }

    function handleNextMonth() {
        if (month === 11) {
            setYear(year + 1);
            setMonth(0);
        } else {
            setMonth(month + 1);
        }
    }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Calendar />);
