export const selectStyles = {
	control: (base, { isFocused }) => ({
		...base,
		minHeight: 'auto',
		margin: 0,
		padding: 0,
		fontSize: 12,
		borderRadius: 0,
		borderColor: isFocused ? '#2563eb' : 'transparent',
		boxShadow: 'none',
		backgroundColor: '#ffffff',
		width: '100%',
		'&:hover': {
			borderColor: isFocused ? '#2563eb' : 'transparent',
		},
	}),

	valueContainer: (base) => ({
		...base,
		minHeight: 18.5,
		padding: '0 4px',
		width: '100%',
	}),

	input: (base) => ({
		...base,
		margin: 0,
		padding: 0,
		fontSize: 12,
		color: '#111827',
		width: '100%',
	}),

	singleValue: (base) => ({
		...base,
		fontSize: 12,
		color: '#111827',
	}),

	placeholder: (base) => ({
		...base,
		fontSize: 12,
		color: '#9ca3af',
	}),

	indicatorsContainer: () => ({
		display: 'none',
	}),

	menu: (base) => ({
		...base,
		top: -17,
		left: '100%',
		marginTop: 0,
		marginBottom: 0,
		marginLeft: 1,
		width: 200,
		zIndex: 9999,
		backgroundColor: '#ffffff',
		borderRadius: 4,
		boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
		overflow: 'hidden',
		border: '1px solid #ccc',
	}),

	menuList: (base) => ({
		...base,
		maxHeight: 220,
		padding: '2px 0px',
		backgroundColor: '#ffffff',
	}),

	option: (base, { isSelected, isFocused }) => ({
		...base,

		borderRadius: 0,
		cursor: 'pointer',
		padding: '3px 8px',
		backgroundColor: isSelected
			? isFocused
				? '#fde047'
				: '#fef08a' // selected: yellow, a bit stronger when focused
			: isFocused
				? '#ced'
				: 'transparent', // arrow-key focus: your green
		color: isSelected ? '#2563eb' : '#111827',
		fontWeight: isSelected ? '700' : 'normal',
	}),

	noOptionsMessage: (base) => ({
		...base,
		fontSize: 12,
		color: '#6b7280',
	}),
};
