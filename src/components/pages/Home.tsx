import { Carousel } from "antd";
import { FunctionComponent } from "react";

export const Home: FunctionComponent = () => {
    return (
        <div className="carousel-container">
            <Carousel arrows autoplay autoplaySpeed={8000} speed={1500} infinite>
                <div>
                    <h3 className="carousel-element">
                        Bienvenue sur le site de l'association musulmane du chablais.<br />
                        Vous pouvez vous inscrire ou inscrire vos enfants aux cours dispensés par l'association en remplissant le formulaire.<br />
                        Vous pouvez également devenir adhérent en remplissant le formulaire prévu à cet effet.
                    </h3>
                    <div className="logo-carousel hidden-xs" />
                </div>
                <div>
                    <h3 className="carousel-element">
                        Si vous souhaitez inscrire vos enfants aux cours de langue arabe dispensés par l'association,<br />
                        il vous suffit de remplir le formulaire en accédant au menu dédié ou en cliquant <a href="/coursEnfants">ici</a>.
                    </h3>
                    <div className="logo-carousel" />
                </div>
                <div>
                    <h3 className="carousel-element">
                        Si vous souhaitez vous inscrire aux cours de langue arabe pour adultes dispensés par l'association,<br />
                        il vous suffit de remplir le formulaire en accédant au menu dédié, ou en cliquant <a href="/coursAdultes">ici</a>.
                    </h3>
                    <div className="logo-carousel" />
                </div>
                <div>
                    <h3 className="carousel-element">Vous pouvez également soutenir l'association en devenant adhérent de l'AMC, en vous inscrivant via le menu dédié ou en cliquant <a href="/adhesion">ici</a>.<br /></h3>
                    <div className="logo-carousel" />
                </div>
            </Carousel>
        </div>
    );

}