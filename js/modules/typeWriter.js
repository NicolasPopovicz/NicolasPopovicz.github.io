export default function initTypeWriter() {
	const target = document.querySelector(".writer");
	const writer = new Typewriter(target, {
		loop: true,
		typeSpeed: 80,
		deleteSpeed: 80,
	});

	writer
		.typeString("JavaScript ES")
		.pauseFor(1500)
		.deleteAll()
		.typeString("Tailwind CSS & Vue.js")
		.pauseFor(1500)
		.deleteAll()
		.typeString("Bootstrap")
		.pauseFor(1500)
		.deleteAll()
		.typeString("PHP & Laravel")
		.pauseFor(2000)
		.start();
}
