export function isRecurringEvent(title: string): boolean {
	return title.includes('Tavern Roulette')
		|| title.includes('Roleplay Roulette')
		|| title.includes('EGF')
		|| title.includes('Duel Night')
		|| title.includes('Greatest Fighter');
}
