export const panelStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 1px',
  minHeight: 0,
} as const;

export const panelToolbarStyle = {
  display: 'flex',
  borderBottom: '1px solid rgb(217 223 230)',
} as const;

export const panelBodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  padding: 8,
  flex: '1 1 1px',
  minHeight: 0,
  overflow: 'auto',
} as const;
