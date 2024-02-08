export default function initTypeWriter() {
	const target = document.querySelector(".writer");
	const writer = new Typewriter(target, {
		loop: true,
		typeSpeed: 110,
		deleteSpeed: 80,
	});

	writer
		.typeString("JavaScript & TypeScript")
		.pauseFor(1500)
		.deleteAll()
		.typeString("Tailwind CSS & Vue.js")
		.pauseFor(1500)
		.deleteAll()
		.typeString("Bootstrap")
		.pauseFor(1500)
		.deleteAll()
		.typeString("PHP (Laravel & Symfony)")
		.pauseFor(2000)
		.start();
}
