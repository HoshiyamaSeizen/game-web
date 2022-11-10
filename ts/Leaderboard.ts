export class Leaderboard {
	public static load() {
		const leaderboard = <HTMLTableSectionElement>document.getElementById('tbody')!;
		const highscores: { name: string; score: number }[] = JSON.parse(
			localStorage.getItem('highscores') || '[]'
		);
		leaderboard.innerHTML = '';
		highscores.forEach((el, index) => {
			const tr = leaderboard.insertRow();
			const place = tr.insertCell();
			const name = tr.insertCell();
			const score = tr.insertCell();
			place.innerText = (index + 1).toString();
			name.innerText = el.name;
			score.innerText = el.score.toString();
		});
	}

	public static update(data: { name: string; score: number }) {
		const highscores: { name: string; score: number }[] = JSON.parse(
			localStorage.getItem('highscores') || '[]'
		);

		const user = highscores.find((user) => {
			if (user.name === data.name) {
				user.score = Math.max(+user.score, data.score);
				return true;
			}
		});
		if (!user) {
			let top = 0;
			for (const { score } of highscores) {
				if (data.score > score) break;
				top++;
			}

			if (top < 10 || highscores.length < 10) {
				highscores.splice(top, 0, {
					name: data.name,
					score: data.score,
				});
				if (highscores.length > 10) highscores.pop();
			}
		}
		localStorage.setItem('highscores', JSON.stringify(highscores));
	}
}
