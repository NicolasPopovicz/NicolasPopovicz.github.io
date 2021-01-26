export default function initTypeWriter() {
	const target = document.querySelector(".writer");
	const writer = new Typewriter(target, {
		loop: true,
		typeSpeed: 80,
		deleteSpeed: 80,
	});

	writer
		.typeString("HTML5 e CSS3")
		.pauseFor(1500)
		.deleteAll()
		.typeString("JavaScript ES")
		.pauseFor(1500)
		.deleteAll()
		.typeString("Tailwind CSS e Vue.js")
		.pauseFor(1500)
		.deleteAll()
		.typeString("entre outros...")
		.pauseFor(2000)
		.start();
}
