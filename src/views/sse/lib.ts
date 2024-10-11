export const blueLog = (log: string) => `\x1b[1;96m${log}\x1b[0m`;
export const greenLog = (log: string) => `\x1b[1;92m${log}\x1b[0m`;
export const yellowLog = (log: string) => `\x1b[1;93m${log}\x1b[0m`;
export const redLog = (log: string) => `\x1b[1;91m${log}\x1b[0m`;
export const whiteLog = (log: string) => `\x1b[97m${log}\x1b[0m`;

// gitlab style
// export const blueLog = (log: string) => `\x1b[36;1m${log}\x1b[0;m`;
// export const greenLog = (log: string) => `\x1b[32;1m${log}\x1b[0;m`;
// export const yellowLog = (log: string) => `\x1b[1;93m${log}\x1b[0;m`;
// export const redLog = (log: string) => `\x1b[31;1m${log}\x1b[0;m`;
// export const whiteLog = (log: string) => `\x1b[97m${log}\x1b[0;m`;
