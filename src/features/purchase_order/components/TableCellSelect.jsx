import Select, { components } from 'react-select';
import { selectStyles } from '../../../utils/components/selectStyle.js';
import { useEffect, useState } from 'react';

// These three MUST stay outside the component
const blockHover = (event) => event.stopPropagation();

const MenuWithTitle = (props) => (
	<components.Menu {...props}>
		<div onMouseOverCapture={blockHover} onMouseMoveCapture={blockHover}>
			<div
				style={{
					padding: '3px 12px',
					fontSize: 12,
					fontWeight: 600,
					color: 'white',
					backgroundColor: '#2a67b1',
					borderBottom: '1px solid #e5e7eb',
				}}
			>
				{props.selectProps.menuTitle}
			</div>

			{props.children}
		</div>
	</components.Menu>
);

const selectComponents = { Menu: MenuWithTitle };

const TableCellSelect = ({
	title,
	options,
	value,
	onChange,
	inputRef,
	onEnter,
	isClearable = false,
	formatOptionLabel,
}) => {
	const [menuOpen, setMenuOpen] = useState(false);

	const selectedOption =
		options.find((option) => option.value === value) || null;

	const handleChange = (option) => {
		onChange?.(option);

		// Navigate after selecting an option using mouse or keyboard.
		if (option) {
			requestAnimationFrame(() => onEnter?.());
		}
	};

	const handleKeyDown = (event) => {
		// If the menu is closed, Enter moves to the next cell.
		// If it is open, React Select handles Enter to select an option.
		if (event.key === 'Enter' && !menuOpen && selectedOption) {
			event.preventDefault();
			onEnter?.();
		}
	};

	

	return (
		<div>
			<Select
				ref={inputRef}
				options={options}
				value={selectedOption}
				onChange={handleChange}
				menuTitle={title}
				placeholder={title}
				styles={selectStyles}
				isClearable={isClearable}
				formatOptionLabel={formatOptionLabel}
				components={selectComponents}
				onKeyDown={handleKeyDown}
				openMenuOnFocus
				onMenuOpen={() => setMenuOpen(true)}
				onMenuClose={() => setMenuOpen(false)}
			/>
		</div>
	);
};

export default TableCellSelect;