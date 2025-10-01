export default function Footer() {
	const currentYear = new Date().getFullYear(); // Obtener el año actual dinámicamente
	return `
	<div class="footer__info">
		<h2 class="footer__title">Sobre Nosotros</h2>
		<p class="footer__description">
			La Granja El Lembo, ubicada en la vereda El Lembo de Santa Rosa de Cabal, Risaralda, es una subsede del Centro Pecuario y Agroempresarial del SENA de la región. Su historia se remonta a su creación como un espacio de formación y desarrollo agropecuario.<br /><br />
			Hace más de una década, la granja fue donada por la Gobernación de Risaralda y la Alcaldía de Santa Rosa de Cabal. Las 15 hectáreas donadas por la Gobernación, junto con las 5 de la alcaldía, suman un total de 20 hectáreas.<br /><br />
			A lo largo de los años, la Granja El Lembo se ha consolidado como un centro de formación vital para el sector agropecuario de la región. En sus instalaciones, los aprendices pueden vivenciar y aplicar conocimientos en diversas áreas, como la producción porcina, avícola, agrícola, pecuaria y agroindustrial.<br /><br />
			Este espacio no solo es un lugar de aprendizaje, sino también un punto de encuentro para la comunidad agrícola local, donde se promueven prácticas sostenibles y se impulsa el desarrollo rural.<br /><br />
		</p>

		<p class="footer__rights">
            © ${currentYear} Sistema de Gestión Agraria Lembo. Todos los derechos reservados.
        </p>
	</div>
	<div class="footer__logo-container">
		<img src="../imgs/sgal.jpeg" alt="logo SGAL" class="logo_sgal" />
	</div>
    `;
}
