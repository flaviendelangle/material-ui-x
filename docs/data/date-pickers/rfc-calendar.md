---
productId: x-date-pickers
title: DX - Calendar
---

# Calendar

<p class="description">This page describes how people can use date views with Material UI and how they can build custom date views.</p>

:::success
This page extends the initial proposal made in [#15598](https://github.com/mui/mui-x/issues/15598)
:::

## Usage with only days

### Without Material UI

The user can use the `<Calendar.DaysGrid />`, `<Calendar.DaysGridHeader />`, `<Calendar.DaysGridHeaderCell />`, `<Calendar.DaysGridBody />`, `<Calendar.DaysWeekRow />` and `<Calendar.DaysCell />` components to create a grid of days:

```tsx
import { Calendar } from '@base-ui-components/react-x-date-pickers/calendar';

<Calendar.Root value={value} onValueChange={setValue}>
  {({ visibleMonth }) => (
    <React.Fragment>
      <div>
        <Calendar.SetVisibleMonth target="previous">◀</Calendar.SetVisibleMonth>
        {visibleMonth.format('MMMM YYYY')}
        <Calendar.SetVisibleMonth target="next">▶</Calendar.SetVisibleMonth>
      </div>
      <Calendar.DaysGrid>
        <Calendar.DaysGridHeader>
          {({ days }) =>
            days.map((day) => (
              <Calendar.DaysGridHeaderCell value={day} key={day.toString()} />
            ))
          }
        </Calendar.DaysGridHeader>
        <Calendar.DaysGridBody>
          {({ weeks }) =>
            weeks.map((week) => (
              <Calendar.DaysWeekRow value={week}>
                {({ days }) =>
                  days.map((day) => (
                    <Calendar.DaysCell value={day} key={day.toString()} />
                  ))
                }
              </Calendar.DaysWeekRow>
            ))
          }
        </Calendar.DaysGridBody>
      </Calendar.DaysGrid>
    </React.Fragment>
  )}
</Calendar.Root>;
```

### With Material UI

:::success
No DX change here compared to today
:::

The user can use the `<DateCalendar />` and limit the views:

```tsx
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

<DateCalendar views={['day']} value={value} onChange={setValue} />;
```

## Usage with only months

### Without Material UI

#### List layout

The user can use the `<Calendar.MonthsList />` and `<Calendar.MonthsCell />` components to create a list of months and utility components like `<Calendar.SetVisibleYear />` to create a header to navigate across the years:

```tsx
import { Calendar } from '@base-ui-components/react-x-date-pickers/calendar';

<Calendar.Root value={value} onValueChange={setValue}>
  {({ visibleMonth }) => (
    <React.Fragment>
      <div>
        <Calendar.SetVisibleYear target="previous">◀</Calendar.SetVisibleYear>
        {visibleMonth.format('YYYY')}
        <Calendar.SetVisibleYear target="next">▶</Calendar.SetVisibleYear>
      </div>
      <Calendar.MonthsList>
        {({ months }) =>
          months.map((month) => (
            <Calendar.MonthsCell value={month} key={month.toString()} />
          ))
        }
      </Calendar.MonthsList>
    </React.Fragment>
  )}
</Calendar.Root>;
```

#### Grid layout

The user can use the `<Calendar.MonthsGrid />` and `<Calendar.MonthsCell />` components to create a grid of months and utility components like `<Calendar.SetVisibleYear />` to create a header to navigate across the years:

```tsx
import { Calendar } from '@base-ui-components/react-x-date-pickers/calendar';

<Calendar.Root value={value} onValueChange={setValue}>
  {({ visibleMonth }) => (
    <React.Fragment>
      <div>
        <Calendar.SetVisibleYear target="previous">◀</Calendar.SetVisibleYear>
        {visibleMonth.format('YYYY')}
        <Calendar.SetVisibleYear target="next">▶</Calendar.SetVisibleYear>
      </div>
      <Calendar.MonthsGrid cellsPerRow={2}>
        {({ months }) =>
          months.map((month) => (
            <Calendar.MonthsCell value={month} key={month.toString()} />
          ))
        }
      </Calendar.MonthsGrid>
    </React.Fragment>
  )}
</Calendar.Root>;
```

### With Material UI

:::success
No DX change here compared to today
:::

The user can use the `<MonthCalendar />` component:

```tsx
import { MonthCalendar } from '@mui/x-date-pickers/MonthCalendar';

<MonthCalendar value={value} onChange={setValue}>
```

:::success
The big limitation here is that the `<MonthCalendar />` component does not have a header to navigate through the years.
Once the `Calendar.*` unstyled component is ready, the `<MonthCalendar />` should probably be reworked to improve this (or removed in favor of always using `<DateCalendar />`).
:::

## Usage with only years

### Without Material UI

#### List layout

The user can use the `<Calendar.YearsList />` and `<Calendar.YearsCell />` components to create a list of years:

```tsx
import { Calendar } from '@base-ui-components/react-x-date-pickers/calendar';

<Calendar.Root value={value} onValueChange={setValue}>
  <Calendar.YearsList>
    {({ years }) =>
      years.map((year) => <Calendar.YearsCell value={year} key={year.toString()} />)
    }
  </Calendar.YearsList>
</Calendar.Root>;
```

#### Grid layout

The user can use the `<Calendar.YearsGrid />` and `<Calendar.YearsCell />` components to create a grid of years:

```tsx
import { Calendar } from '@base-ui-components/react-x-date-pickers/calendar';

<Calendar.Root value={value} onValueChange={setValue}>
  <Calendar.YearsGrid cellsPerRow={3}>
    {({ years }) =>
      years.map((year) => <Calendar.YearsCell value={year} key={year.toString()} />)
    }
  </Calendar.YearsGrid>
</Calendar.Root>;
```

### With Material UI

:::success
No DX change here compared to today
:::

The user can use the `<YearCalendar />` component:

```tsx
import { YearCalendar } from '@mui/x-date-pickers/YearCalendar';

<YearCalendar value={value} onChange={setValue}>
```

:::success
The big limitation here is that the `<YearCalendar />` component does not have a header to navigate through the years.
Once the `Calendar.*` unstyled component is ready, the `<YearCalendar />` should probably be reworked to improve this (or removed in favor of always using `<DateCalendar />`).
:::

## Day + month + years

### Without Material UI

```tsx
import { Calendar } from '@base-ui-components/react-x-date-pickers/calendar';

function DateCalendar() {
  const [value, setValue] = React.useState(null);
  const [activeSection, setActiveSection] = React.useState<'day' | 'month' | 'year'>(
    'day',
  );

  const handleValueChange = (newValue, context) => {
    if (context.section === 'month' || context.section === 'year') {
      setActiveSection('day');
    }

    setValue(newValue);
  };

  return (
    <Calendar.Root value={value} onValueChange={handleValueChange}>
      <div>{/** See calendar header documentation */}</div>
      {activeSection === 'day' && (
        <Calendar.DaysGrid>
          <Calendar.DaysGridHeader>
            {({ days }) =>
              days.map((day) => (
                <Calendar.DaysGridHeaderCell value={day} key={day.toString()} />
              ))
            }
          </Calendar.DaysGridHeader>
          <Calendar.DaysGridBody>
            {({ weeks }) =>
              weeks.map((week) => (
                <Calendar.DaysWeekRow value={week} key={week.toString()}>
                  {({ days }) =>
                    days.map((day) => (
                      <Calendar.DaysCell value={day} key={day.toString()} />
                    ))
                  }
                </Calendar.DaysWeekRow>
              ))
            }
          </Calendar.DaysGridBody>
        </Calendar.DaysGrid>
      )}
      {activeSection === 'month' && (
        <Calendar.MonthsList>
          {({ months }) =>
            months.map((month) => (
              <Calendar.MonthsCell value={month} key={month.toString()} />
            ))
          }
        </Calendar.MonthsList>
      )}
      {activeSection === 'year' && (
        <Calendar.YearsList>
          {({ years }) =>
            years.map((year) => (
              <Calendar.YearsCell value={year} key={year.toString()} />
            ))
          }
        </Calendar.YearsList>
      )}
    </Calendar.Root>
  );
}
```

### With Material UI

:::success
No DX change here compared to today
:::

The user can use the `<DateCalendar />` component and add the month view:

```tsx
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

<DateCalendar value={value} onChange={setValue}>
```

:::success
When MD3 is supported, the default views of `<DateCalendar />` should probably be `['year', 'month', 'day']`
:::

## Calendar header

### Without Material UI

The user can use the `<Calendar.SetVisibleMonth />` to build basically any kind of header they could think of:

#### Very basic header (without month and year UI)

```tsx
import { Calendar } from '@base-ui-components/react-x-date-pickers/calendar';

function CalendarHeader() {
  const { visibleMonth } = useCalendarContext();

  return (
    <div>
      <Calendar.SetVisibleMonth target="previous">◀</Calendar.SetVisibleMonth>
      {visibleMonth.format('MMMM YYYY')}
      <Calendar.SetVisibleMonth target="next">▶</Calendar.SetVisibleMonth>
    </div>
  );
}
```

#### MD2 header (MUI X implementation)

```tsx
import {
  Calendar,
  useCalendarContext,
} from '@base-ui-components/react-x-date-pickers/calendar';

function CalendarHeader(props: {
  activeSection: 'day' | 'month' | 'year';
  onActiveSectionChange: (activeSection: 'day' | 'month' | 'year') => void;
}) {
  const { activeSection, onActiveSectionChange } = props;
  const { visibleMonth } = useCalendarContext();

  return (
    <div>
      <div
        onClick={() =>
          onActiveSectionChange(activeSection === 'year' ? 'month' : 'year')
        }
      >
        {visibleMonth.format('MMMM YYYY')}
        {activeSection === 'year' ? '▲' : '▼'}
      </div>
      {activeSection === 'day' && (
        <div>
          <Calendar.SetVisibleMonth target="previous">◀</Calendar.SetVisibleMonth>
          <Calendar.SetVisibleMonth target="next">▶</Calendar.SetVisibleMonth>
        </div>
      )}
    </div>
  );
}
```

The `activeSection` and `onActiveSectionChange` needs to be passed by the parent component:

```tsx
function DateCalendar() {
  const [activeSection, setActiveSection] = React.useState<'day' | 'month' | 'year'>(
    'day',
  );
  return (
    <Calendar.Root>
      <Header
        activeSection={activeSection}
        onActiveSectionChange={setActiveSection}
      />
      {/** Rest of the UI */}
    </Calendar.Root>
  );
}
```

#### MD3 header

```tsx
import { Calendar } from '@base-ui-components/react-x-date-pickers/calendar';

function CalendarHeader(props: {
  activeSection: 'day' | 'month' | 'year';
  onActiveSectionChange: (activeSection: 'day' | 'month' | 'year') => void;
}) {
  const { activeSection, onActiveSectionChange } = props;
  const { visibleMonth } = useCalendarContext();

  return (
    <div>
      <div>
        {activeSection === 'day' && (
          <Calendar.SetVisibleMonth target="previous">◀</Calendar.SetVisibleMonth>
        )}
        <button
          onClick={() =>
            onActiveSectionChange(activeSection === 'year' ? 'day' : 'year')
          }
          disabled={activeSection === 'month'}
        >
          {visibleMonth.format('MMMM')}
        </button>
        {activeSection === 'day' && (
          <Calendar.SetVisibleMonth target="next">▶</Calendar.SetVisibleMonth>
        )}
      </div>
      <div>
        {activeSection === 'day' && (
          <Calendar.SetVisibleYear target="previous">◀</Calendar.SetVisibleYear>
        )}
        <button
          onClick={() =>
            onActiveSectionChange(activeSection === 'month' ? 'day' : 'month')
          }
          disabled={activeSection === 'year'}
        >
          {visibleMonth.format('YYYY')}
        </button>
        {activeSection === 'day' && (
          <Calendar.SetVisibleYear target="next">▶</Calendar.SetVisibleYear>
        )}
      </div>
    </div>
  );
}
```

#### Header with dropdown for months and years

The user can create a custom header where the month and the year editing is done through a menu, while the day calendar is always visible below:

```tsx
import { Menu } from '@base-ui-components/react/menu';
import { Calendar } from '@base-ui-components/react-x-date-pickers/calendar';

function CalendarHeader() {
  const { visibleMonth, activeSection } = useCalendarContext();

  return (
    <div>
      <Menu.Root>
        <Menu.Trigger>{visibleMonth.format('MMMM')}</Menu.Trigger>
        <Menu.Positioner>
          <Calendar.MonthsList alwaysVisible render={<Menu.Popup />}>
            {({ months }) =>
              months.map((month) => (
                <Calendar.MonthsCell value={month} key={month.toString()} />
              ))
            }
          </Calendar.MonthsList>
        </Menu.Positioner>
      </Menu.Root>
      <Menu.Root>
        <Menu.Trigger>{visibleMonth.format('YYYY')}</Menu.Trigger>
        <Menu.Positioner>
          <Calendar.YearsList alwaysVisible render={<Menu.Popup />}>
            {({ years }) =>
              years.map((year) => (
                <Calendar.MonthsCell value={year} key={year.toString()} />
              ))
            }
          </Calendar.YearsList>
        </Menu.Positioner>
      </Menu.Root>
    </div>
  );
}
```

### With Material UI

The user can use slots to override part of the UI in self-contained components:

```tsx
<DateCalendar slots={{ calendarHeader: CustomCalendarHeader }} />
```

:::success
The concept of slots does not fit this use case very well, but the exploration of a better DX to override part of the UI in self-contained component is outside the scope of this documentation, so this RFC uses the tools currently available.
:::

The `<CustomCalendarHeader />` component can be built in a few different ways:

1. From scratch:

   This is mostly viable for components that don't interact a lot with the picker state. For example, if someone wants to build a custom header for their calendar that just displays the current month, they could do it from scratch:

   ```tsx
   import { useCalendarContext } from '@base-ui-components/react-x-date-pickers/calendar';

   function CustomCalendarHeader() {
     const { currentMonth } = useCalendarContext();

     return <div>{currentMonth.format('MMMM YYYY')}</div>;
   }
   ```

   This is not the recommended way, but nothing prevents it.

   :::success
   The `calendarHeader` slot does not receive `currentMonth` as a prop but instead access it using `useCalendarContext()`.
   That way, the API is consistent with and without Material UI, and if we introduce a composable version with Material UI in the future it will work fine.
   :::

2. Using the primitives exposed by `@base-ui-components/react-x-date-pickers/calendar`:

   If the user wants to totally own the styling of this part of the UI (because the UI is really different from the default one), he can use components like `<Calendar.SetVisibleMonth />` only for this part of the UI while still using `@mui/x-date-pickers` for everything he doesn't want to deeply customize:

   ```tsx
   import { Calendar } from '@base-ui-components/react-x-date-pickers/calendar';

   function CustomCalendarHeader() {
     const { visibleMonth } = useCalendarContext();

     return (
       <div>
         <Calendar.SetVisibleMonth target="previous">◀</Calendar.SetVisibleMonth>
         {visibleMonth.format('MMMM YYYY')}
         <Calendar.SetVisibleMonth target="next">▶</Calendar.SetVisibleMonth>
       </div>
     );
   }
   ```

3. Using the `PickerCalendarHeader*` components exposed by `@mui/x-date-pickers/PickerCalendarHeader`:

   ```tsx
   import {
     PickersCalendarHeaderRoot,
     PickersCalendarHeaderLabel,
   } from '@mui/x-date-pickers/PickersCalendarHeader';

   function CustomCalendarHeader() {
     return (
       <PickersCalendarHeaderRoot>
         <PickerCalendarHeaderLabelContainer>
           <PickersCalendarHeaderLabel format="MMMM YYYY" />
         </PickerCalendarHeaderLabelContainer>
       </PickersCalendarHeaderRoot>
     );
   }
   ```

   :::success
   The components like `<PickersCalendarHeaderRoot />` would be built on top of their `@base-ui-components/react-x-date-pickers/Calendar` counterparts and would be used to build `<PickersCalendarHeader />`. The packages expose several version but they don't have logic duplication.
   Internally, the code would look something like that:

   ```tsx
   import { Calendar } from '@base-ui-components/react-x-date-pickers/calendar';

   export const PickerCalendarHeaderRoot = styled('div')({
     display: 'flex',
     alignItems: 'center',
     marginTop: 12,
     marginBottom: 4,
     paddingLeft: 24,
     paddingRight: 12,
   });

   // This component is purely presentational and not present in `@base-ui-components/react-x-date-pickers/Calendar'.
   export const PickerCalendarHeaderLabel = styled('span')({
     /** ... */
   });

   // This component is purely presentational and not present in `@base-ui-components/react-x-date-pickers/Calendar'.
   export const PickerCalendarHeaderLabelContainer = styled('div')({
     /** ... */
   });

   export const PickerCalendarHeader = (props) => {
     const { format, ...other } = props;
     const { value } = useCalendarContext();

     return (
       <PickerCalendarHeaderRoot {...other}>
         <PickerCalendarHeaderLabelContainer>
           {value.format(format)}
         </PickerCalendarHeaderLabelContainer>
       </PickerCalendarHeaderRoot>
   };
   ```

   :::

   :::success
   This one is unclear.
   Maybe those composable but styled components should only be exposed for parts of the UI where the Material UI implementation has some complexity and people want to be able to use composition to customize it without going fully unstyled for this part of the UI.

   And if those composable but styled components are something worth doing, then they need to have a coherent export strategy.
   Should it be:

   1. `<PickersCalendarHeaderRoot />` like it would be today
   2. `<Calendar.Header />` to match the exports from `@base-ui-components/react-x-date-pickers`
   3. Something else?

   :::

## Display multiple months

### Without Material UI

The user can use the `offset` prop of the `<Calendar.DaysGrid />` component to render months with an offset compared to the currently visible month:

```tsx
import { Calendar } from '@base-ui-components/react-x-date-pickers/calendar';

function CalendarGrid({ offset }) {
  return (
    <Calendar.DaysGrid offset={offset}>
      <Calendar.DaysGridHeader>
        {({ days }) =>
          days.map((day) => (
            <Calendar.DaysGridHeaderCell value={day} key={day.toString()} />
          ))
        }
      </Calendar.DaysGridHeader>
      <Calendar.DaysGridBody>
        {({ weeks }) =>
          weeks.map((week) => (
            <Calendar.DaysWeekRow value={week} key={week.toString()}>
              {({ days }) =>
                days.map((day) => (
                  <Calendar.DaysCell value={day} key={day.toString()} />
                ))
              }
            </Calendar.DaysWeekRow>
          ))
        }
      </Calendar.DaysGridBody>
    </Calendar.DaysGrid>
  );
}

<Calendar.Root value={value} onValueChange={setValue}>
  <div>{/** See demo below for the navigation with multiple months */}</div>
  <div>
    <CalendarGrid offset={0} />
    <CalendarGrid offset={1} />
  </div>
</Calendar.Root>;
```

#### Month navigation with multiple months

There is two way to navigate to the next / previous months:

1. With the `<Calendar.SetVisibleMonth />` button
2. With the arrow navigation when the target is not in the current month

When rendering multiple months, both those navigation technic only navigate one month at the time.
For example, if you were rendering May and June, pressing `<Calendar.SetVisibleMonth target="next" />` will render June and July.

The user can use the `monthPageSize` prop on the `<Calendar.Root />` component to customize this behavior.

If the prop receives a number, it will move by the amount of month both for `<Calendar.SetVisibleMonth />` and for arrow navigation:

```tsx
import { Calendar } from '@base-ui-components/react-x-date-pickers/calendar';

function CalendarHeader() {
  const { visibleMonth } = useCalendarContext();

  return (
    <Calendar.Root monthPageSize={2}>
      <div>
        <Calendar.SetVisibleMonth target="previous">◀</Calendar.SetVisibleMonth>
        {visibleMonth.format('MMMM YYYY')}
        {' – '}
        {visibleMonth.add(1, 'month').format('MMMM YYYY')}
        <Calendar.SetVisibleMonth target="next">▶</Calendar.SetVisibleMonth>
      </div>
      <CalendarGrid offset={0} />
      <CalendarGrid offset={1} />
    </Calendar.Root>
  );
}
```

But the user can also distinguish both behaviors by providing an object:

```tsx
import { Calendar } from '@base-ui-components/react-x-date-pickers/calendar';

function CalendarHeader() {
  const { visibleMonth } = useCalendarContext();

  return (
    <Calendar.Root monthPageSize={{ keyboard: 2, button: 1 }}>
      <div>
        <Calendar.SetVisibleMonth target="previous">◀</Calendar.SetVisibleMonth>
        {visibleMonth.format('MMMM YYYY')}
        {' – '}
        {visibleMonth.add(1, 'month').format('MMMM YYYY')}
        <Calendar.SetVisibleMonth target="next">▶</Calendar.SetVisibleMonth>
      </div>
      <CalendarGrid offset={0} />
      <CalendarGrid offset={1} />
    </Calendar.Root>
  );
}
```

### With Material UI

This is currently not doable.

## Display week number

### Without Material UI

The user can add custom elements to add the week number to the grid:

```tsx
<Calendar.DaysGrid>
  <Calendar.DaysGridHeader>
    {({ days }) => (
      <React.Fragment>
        <span role="columnheader" aria-label="Week number">
          #
        </span>
        {days.map((day) => (
          <Calendar.DaysGridHeaderCell value={day} key={day.toString()} />
        ))}
      </React.Fragment>
    )}
  </Calendar.DaysGridHeader>
  <Calendar.DaysGridBody>
    {({ weeks }) =>
      weeks.map((week) => (
        <Calendar.DaysWeekRow value={week} key={week.toString()}>
          {({ days }) => (
            <React.Fragment>
              <span role="rowheader" aria-label={`Week ${days[0].week()}`}>
                {days[0].week()}
              </span>
              {days.map((day) => (
                <Calendar.DaysCell value={day} key={day.toString()} />
              ))}
            </React.Fragment>
          )}
        </Calendar.DaysWeekRow>
      ))
    }
  </Calendar.DaysGridBody>
</Calendar.DaysGrid>
```

### With Material UI

:::success
No DX change here compared to today
:::

The user can use the `<DateCalendar />` with the `displayWeekNumber` prop:

```tsx
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

<DateCalendar displayWeekNumber views={['day']} value={value} onChange={setValue} />;
```

## Anatomy of `Calendar.*`

### `Calendar.Root`

Top level component that wraps the other components.

#### Props

- Extends `React.HTMLAttributes<HTMLDivElement>`

- **Value props**: `value`, `defaultValue`, `referenceDate`, `onValueChange`, `onError` and `timezone`.

  Same typing and behavior as today (just `onChange` becomes `onValueChange`)

- **Validation props**: `maxDate`, `minDate`, `disableFuture`, `disablePast`, `shouldDisableDate`, `shouldDisableMonth`, `shouldDisableYear`.

  Same typing and behavior as today.

- **Form props**: `disabled`, `readOnly`.

  Same typing and behavior as today.

- `autoFocus`: `boolean`

- `monthPageSize`: `number | { keyboard: number, button: number }`, default: `1`. The amount of months to navigate by in the day grid when pressing `<Calendar.SetVisibleMonth />` or with arrow navigation.

- `children`: `React.ReactNode | (contextValue: CalendarContextValue) => React.ReactNode`

:::success
All the props that the picker can pass to the calendar (validation props, value props, etc...) are read both from the props and from `usePickerContext` so that the calendar can be used inside a picker built with composition.

That way, users only have to pass the props specific to the calendar to the `Calendar.*` components:

```tsx
<Picker.Root manager={manager} {...props} disablePast>
  <PickerField.Root>{/** See the field documentation */}</PickerField.Root>
  <Popover.Backdrop />
  <Popover.Positioner>
    <Popover.Popup>
      <Calendar.Root>
        <Calendar.DaysGrid fixedWeekNumber={6}>
          {/** See demo above */}
        </Calendar.DaysGrid>
      </Calendar.Root>
    </Popover.Popup>
  </Popover.Positioner>
</Picker.Root>
```

:::

### `Calendar.SetVisibleMonth`

Renders a button to go to the previous or the next month.
It does not modify the value it only navigates to the target month.

#### Props

- Extends `React.HTMLAttributes<HTMLButtonElement>`

- `target`: `'previous' | 'next' | PickerValidDate`

:::success
TODO: Clarify the behavior when multiple calendars are rendered at once.
:::

### `Calendar.SetVisibleYear`

Renders a button to go to the previous or the next month.
It does not modify the value it only navigates to the target year.

#### Props

- Extends `React.HTMLAttributes<HTMLButtonElement>`

- `target`: `'previous' | 'next' | PickerValidDate`

:::success
TODO: Clarify the behavior when multiple calendars are rendered at once.
:::

### `Calendar.DaysGrid`

Top level component to pick a day.

#### Props

- Extends `React.HTMLAttributes<HTMLDivElement>`

- `fixedWeekNumber`: `number`

### `Calendar.DaysGridHeader`

Renders the header of the day grid.

It expects a function as its children, which receives the list of days to render as a parameter:

```tsx
<Calendar.DaysGridHeader>
  {({ days }) =>
    days.map((day) => (
      <Calendar.DaysGridHeaderCell value={day} key={day.toString()} />
    ))
  }
</Calendar.DaysGridHeader>
```

#### Props

- Extends `React.HTMLAttributes<HTMLDivElement>`

- `children`: `(params: { days: PickerValidDate[] }) => React.ReactNode`

### `Calendar.DaysGridBody`

Renders the content all the days in a month (it is the DOM element that should contain all the weeks).

It expects a function as its children, which receives the list of weeks to render as a parameter:

```tsx
<Calendar.DaysGridBody>
  {({ weeks }) =>
    weeks.map((week) => <Calendar.DaysWeekRow value={week} key={week.toString()} />)
  }
</Calendar.DaysGridBody>
```

#### Props

- Extends `React.HTMLAttributes<HTMLDivElement>`

- `children`: `(params: { weeks: PickerValidDate[] }) => React.ReactNode`

### `Calendar.DaysWeekRow`

Renders the content all the days in a week.

It expects a function as its children, which receives the list of days to render and the week number as a parameter:

```tsx
<Calendar.DaysWeekRow>
  {({ days }) =>
    days.map((day) => <Calendar.DaysCell value={day} key={day.toString()} />)
  }
</Calendar.DaysWeekRow>
```

#### Props

- Extends `React.HTMLAttributes<HTMLDivElement>`

- `value`: `{ value: PickerValidDate }` - **required**

- `children`: `(params: { days: PickerValidDate[], week: PickerValidDate }) => React.ReactNode`

### `Calendar.DaysCell`

Renders the cell for a single day.

#### Props

- Extends `React.HTMLAttributes<HTMLButtonElement>`

- `value`: `PickerValidDate` - **required**

### `Calendar.MonthsList`

Top level component to pick a month.

It expects a function as its children, which receives the list of the months to render as a parameter:

```tsx
<Calendar.MonthsList>
  {({ months }) =>
    months.map((month) => (
      <Calendar.MonthsCell value={month} key={month.toString()} />
    ))
  }
</Calendar.MonthsList>
```

This component takes care of the keyboard navigation (for example <kbd class="key">Arrow Up</kbd>).

#### Props

- Extends `React.HTMLAttributes<HTMLDivElement>`

- `children`: `(params: { months: PickerValidDate[] }) => React.ReactNode`

- `itemsOrder`: `'asc' | 'desc'`, default: `'asc'`.

- `alwaysVisible`: `boolean`, default: `false`. By default this component is only rendered when the active section is `"month"`.

### `Calendar.MonthsGrid`

Top level component to pick a month, when the layout is a grid.

It expects a function as its children, which receives the list of months to render as a parameter:

```tsx
<Calendar.MonthsGrid cellsPerRow={2}>
  {({ months }) =>
    months.map((month) => (
      <Calendar.MonthsCell value={month} key={month.toString()} />
    ))
  }
</Calendar.MonthsGrid>
```

This component takes care of the keyboard navigation (for example <kbd class="key">Arrow Up</kbd>).

#### Props

- Extends `React.HTMLAttributes<HTMLDivElement>`

- `children`: `(params: { months: PickerValidDate[] }) => React.ReactNode`

- `cellsOrder`: `'asc' | 'desc'`, default: `'asc'`.

- `cellsPerRow`: `number` **required**.

### `Calendar.MonthsCell`

Renders the cell for a single month.

#### Props

- Extends `React.HTMLAttributes<HTMLButtonElement>`

- `value`: `PickerValidDate` - **required**.

### `Calendar.YearsList`

Top level component to pick a year when the layout is a list.

It expects a function as its children, which receives the list of years to render as a parameter:

```tsx
<Calendar.YearsList>
  {({ years }) =>
    years.map((year) => <Calendar.YearsCell value={year} key={year.toString()} />)
  }
</Calendar.YearsList>
```

This component takes care of the keyboard navigation (for example <kbd class="key">Arrow Up</kbd>).

#### Props

- Extends `React.HTMLAttributes<HTMLDivElement>`

- `children`: `(params: { years: PickerValidDate[] }) => React.ReactNode`

- `cellsOrder`: `'asc' | 'desc'`, default: `'asc'`.

### `Calendar.YearsGrid`

Top level component to pick a year when the layout is a grid.

It expects a function as its children, which receives the list of years to render as a parameter:

```tsx
<Calendar.YearsGrid cellsPerRo={3}>
  {({ years }) =>
    years.map((year) => <Calendar.YearsCell value={year} key={year.toString()} />)
  }
</Calendar.YearsGrid>
```

This component takes care of the keyboard navigation (for example <kbd class="key">Arrow Up</kbd>).

#### Props

- Extends `React.HTMLAttributes<HTMLDivElement>`

- `children`: `(params: { years: PickerValidDate[] }) => React.ReactNode`

- `cellsOrder`: `'asc' | 'desc'`, default: `'asc'`.

- `cellsPerRow`: `number` **required**.

### `Calendar.YearsCell`

Renders the cell for a single year.

#### Props

- Extends `React.HTMLAttributes<HTMLButtonElement>`

- `value`: `PickerValidDate` - **required**.
