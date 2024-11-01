import { FunctionComponent } from "react";

export const Home: FunctionComponent = () => (
    <div className="centered-content">
        <div>
            <h1>Bienvenue sur le site de l'association musulmane du chablais</h1>
            <br />
            <br />
            <p className="home">
                Vous pouvez vous inscrire aux cours dispensés par l'association musulmane du Chablais.<br /><br />
                Pour ce faire, veuillez remplir le formulaire en accédant au menu dédié pour les cours pour <a href="/coursEnfants">enfant</a> ou les cours pour <a href="/coursAdultes">adultes</a>.<br />
                Vous pouvez également devenir adhérent de l'association, en vous inscrivant via le menu dédié ou en cliquant <a href="/adhesion">ici</a>.<br />
                Vous serez recontactez ultérieurement pour finaliser votre inscription/adhésion.<br /><br />
            </p>
        </div>
    </div>
);