type CoreSignals1 = 'SIGABRT' | 'SIGBUS' | 'SIGFPE' | 'SIGILL' | 'SIGSEGV' | 'SIGTERM' | 'SIGQUIT';
type CoreSignals = 'SIGSYS' | CoreSignals1;
type StopSignals = 'SIGSTOP' | 'SIGTSTP' | 'SIGTTIN' | 'SIGTTOU';
type TermSignals = 'SIGINT' | 'SIGTERM' | 'SIGHUP' | 'SIGKILL' | 'SIGPIPE';
type Signals = CoreSignals | StopSignals | TermSignals;

export const signals: Signals[] = [
	'SIGINT',
	'SIGTERM',
	'SIGHUP',
	'SIGPIPE',
	'SIGABRT',
	'SIGBUS',
	'SIGFPE',
	'SIGILL',
	'SIGSEGV',
	'SIGSYS',
	'SIGQUIT',
];
