-- Crée la table sites
CREATE TABLE IF NOT EXISTS sites
(
    id
    TEXT
    PRIMARY
    KEY,
    name
    TEXT
    NOT
    NULL,
    lat
    REAL
    NOT
    NULL,
    lon
    REAL
    NOT
    NULL,
    orientations
    TEXT
    NOT
    NULL, -- JSON array
    windMin
    INTEGER
    NOT
    NULL,
    windMax
    INTEGER
    NOT
    NULL
);

-- Insère les sites
INSERT INTO sites (id, name, lat, lon, orientations, windMin, windMax)
VALUES ('olhain', 'Olhain', 50.4343, 2.586, '["SSO","S"]', 13, 23),
       ('lacomte', 'La Comté', 50.433331, 2.5, '["O","ONO","NO","NNO"]', 13, 25),
       ('licques', 'Licques', 50.7855, 1.9355, '["SSE","S","SSO"]', 13, 22),
       ('equihen', 'Equihen', 50.6796, 1.567, '["OSO","O"]', 15, 30),
       ('parcdesiles', 'Parc des Iles', 50.4014, 2.9342, '["SE","S"]', 13, 25),
       ('montsainteloi', 'Mont Saint Eloi', 50.3311, 2.6632, '["NE","SO"]', 13, 25),
       ('zuydcoote', 'Zuydcoote', 51.0692, 2.4703, '["O","NO","N"]', 15, 30),
       ('wissant', 'Dune de Wissant', 50.8833, 1.6667, '["O","SO","NO","N","NE"]', 15, 30),
       ('sangatte', 'Sangatte', 50.9412, 1.7378, '["NO"]', 15, 30),
       ('escalles', 'Escalles', 50.9167, 1.7167, '["O","NO"]', 15, 30),
       ('frencq', 'Frencq', 50.5605, 1.6662, '["NE"]', 13, 25),
       ('cranauxoeufs', 'Cran aux Oeufs', 50.8472, 1.5833, '["SSE","S","SSO"]', 13, 25),
       ('lacreche', 'La Crèche', 50.7511, 1.5972, '["NO","O"]', 15, 30);