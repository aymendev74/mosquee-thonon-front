import { FunctionComponent } from "react";

export const Home: FunctionComponent = () => (
    <div>
        <h1>Bienvenue sur le site de l'association musulmane du chablais</h1>
        <br />
        <br />
        <p className="home">
            Vous pouvez vous inscrire aux cours dispensés par l'association musulmane du Chablais.<br /><br />
            Pour ce faire, veuillez remplir le formulaire en accédant au menu Inscription (sous-menu <a href="/cours">"Cours arabes"</a>).<br />
            Vous pouvez également devenir adhérent de l'association, en vous inscrivant via le même menu Inscription (sous-menu <a href="/adhesion">"Adhésion"</a>).<br /><br />
            Vous serez recontactez ultérieurement pour finaliser votre inscription/adhésion.<br /><br />
            Enfin, vous pouvez également faire un don afin de soutenir financièrement l'association, en passant par le menu dédié.<br /><br />
        </p>
    </div>
);