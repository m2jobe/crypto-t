export const round = (value, decimals) => {
  return Number(Math.round(Number(`${value}e${decimals}`)) + `e-${decimals}`)
};

export const floor = (value, decimals) => Number(`${Math.floor(`${value}e${decimals}`)}e-${decimals}`);
