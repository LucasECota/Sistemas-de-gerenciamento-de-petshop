-- =====================================================
-- Sistema para Gerenciamento de Petshop
-- Etapa 4 - Scripts SQL de criacao e povoamento
-- =====================================================

DROP TABLE IF EXISTS venda_item CASCADE;
DROP TABLE IF EXISTS venda CASCADE;
DROP TABLE IF EXISTS agendamento_servico CASCADE;
DROP TABLE IF EXISTS agendamento CASCADE;
DROP TABLE IF EXISTS produto CASCADE;
DROP TABLE IF EXISTS servico CASCADE;
DROP TABLE IF EXISTS funcionario CASCADE;
DROP TABLE IF EXISTS pet CASCADE;
DROP TABLE IF EXISTS tutor CASCADE;

-- =====================================================
-- CRIACAO DAS TABELAS
-- =====================================================

CREATE TABLE tutor (
    id_tutor    SERIAL PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    cpf         VARCHAR(14)  NOT NULL UNIQUE,
    telefone    VARCHAR(20),
    email       VARCHAR(100),
    endereco    VARCHAR(200)
);

CREATE TABLE pet (
    id_pet           SERIAL PRIMARY KEY,
    id_tutor         INT NOT NULL,
    nome             VARCHAR(100) NOT NULL,
    especie          VARCHAR(50) NOT NULL,
    raca             VARCHAR(50),
    data_nascimento  DATE,
    peso             DECIMAL(5,2),
    CONSTRAINT fk_pet_tutor FOREIGN KEY (id_tutor)
        REFERENCES tutor (id_tutor)
        ON DELETE CASCADE
);

CREATE TABLE funcionario (
    id_funcionario    SERIAL PRIMARY KEY,
    nome              VARCHAR(100) NOT NULL,
    cpf               VARCHAR(14) NOT NULL UNIQUE,
    cargo             VARCHAR(50) NOT NULL,
    data_contratacao  DATE
);

CREATE TABLE servico (
    id_servico  SERIAL PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    descricao   VARCHAR(255),
    preco       DECIMAL(10,2) NOT NULL CHECK (preco >= 0)
);

CREATE TABLE agendamento (
    id_agendamento  SERIAL PRIMARY KEY,
    id_pet          INT NOT NULL,
    id_funcionario  INT NOT NULL,
    data_hora       TIMESTAMP NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'agendado'
        CHECK (status IN ('agendado', 'concluido', 'cancelado')),
    CONSTRAINT fk_agendamento_pet FOREIGN KEY (id_pet)
        REFERENCES pet (id_pet)
        ON DELETE CASCADE,
    CONSTRAINT fk_agendamento_funcionario FOREIGN KEY (id_funcionario)
        REFERENCES funcionario (id_funcionario)
        ON DELETE RESTRICT
);

CREATE TABLE agendamento_servico (
    id_agendamento  INT NOT NULL,
    id_servico      INT NOT NULL,
    PRIMARY KEY (id_agendamento, id_servico),
    CONSTRAINT fk_as_agendamento FOREIGN KEY (id_agendamento)
        REFERENCES agendamento (id_agendamento)
        ON DELETE CASCADE,
    CONSTRAINT fk_as_servico FOREIGN KEY (id_servico)
        REFERENCES servico (id_servico)
        ON DELETE RESTRICT
);

CREATE TABLE produto (
    id_produto  SERIAL PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    preco       DECIMAL(10,2) NOT NULL CHECK (preco >= 0),
    estoque     INT NOT NULL DEFAULT 0 CHECK (estoque >= 0)
);

CREATE TABLE venda (
    id_venda     SERIAL PRIMARY KEY,
    id_tutor     INT NOT NULL,
    data         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor_total  DECIMAL(10,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_venda_tutor FOREIGN KEY (id_tutor)
        REFERENCES tutor (id_tutor)
        ON DELETE RESTRICT
);

CREATE TABLE venda_item (
    id_venda         INT NOT NULL,
    id_produto       INT NOT NULL,
    quantidade       INT NOT NULL CHECK (quantidade > 0),
    preco_unitario   DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id_venda, id_produto),
    CONSTRAINT fk_vi_venda FOREIGN KEY (id_venda)
        REFERENCES venda (id_venda)
        ON DELETE CASCADE,
    CONSTRAINT fk_vi_produto FOREIGN KEY (id_produto)
        REFERENCES produto (id_produto)
        ON DELETE RESTRICT
);

-- =====================================================
-- POVOAMENTO (dados de exemplo)
-- =====================================================

INSERT INTO tutor (nome, cpf, telefone, email, endereco) VALUES
('Ana Paula Souza', '111.111.111-11', '(33) 99111-1111', 'ana.souza@email.com', 'Rua das Flores, 100'),
('Carlos Eduardo Lima', '222.222.222-22', '(33) 99222-2222', 'carlos.lima@email.com', 'Av. Brasil, 500'),
('Mariana Ferreira', '333.333.333-33', '(33) 99333-3333', 'mariana.f@email.com', 'Rua Bahia, 45');

INSERT INTO pet (id_tutor, nome, especie, raca, data_nascimento, peso) VALUES
(1, 'Rex', 'Cachorro', 'Labrador', '2021-05-10', 28.50),
(1, 'Mia', 'Gato', 'Siames', '2022-01-15', 4.20),
(2, 'Thor', 'Cachorro', 'Bulldog Frances', '2020-11-02', 12.00),
(3, 'Nina', 'Gato', 'Persa', '2023-03-20', 3.80);

INSERT INTO funcionario (nome, cpf, cargo, data_contratacao) VALUES
('Fernanda Alves', '444.444.444-44', 'Veterinaria', '2022-02-01'),
('Bruno Costa', '555.555.555-55', 'Tosador', '2023-06-15'),
('Juliana Mendes', '666.666.666-66', 'Atendente', '2023-09-01');

INSERT INTO servico (nome, descricao, preco) VALUES
('Banho', 'Banho completo com produtos hipoalergenicos', 60.00),
('Tosa', 'Tosa higienica ou na tesoura', 50.00),
('Consulta veterinaria', 'Consulta de rotina', 120.00),
('Vacinacao', 'Aplicacao de vacina', 80.00);

INSERT INTO agendamento (id_pet, id_funcionario, data_hora, status) VALUES
(1, 2, '2026-07-20 14:00:00', 'agendado'),
(2, 1, '2026-07-21 10:00:00', 'agendado'),
(3, 2, '2026-07-18 09:00:00', 'concluido');

INSERT INTO agendamento_servico (id_agendamento, id_servico) VALUES
(1, 1), (1, 2),
(2, 3),
(3, 1), (3, 4);

INSERT INTO produto (nome, preco, estoque) VALUES
('Racao Premium 10kg', 189.90, 25),
('Brinquedo Corda', 24.90, 40),
('Shampoo Pet', 39.90, 15),
('Coleira Ajustavel', 34.50, 30);

INSERT INTO venda (id_tutor, data, valor_total) VALUES
(1, '2026-07-10 16:20:00', 214.80),
(2, '2026-07-12 11:05:00', 34.50);

INSERT INTO venda_item (id_venda, id_produto, quantidade, preco_unitario) VALUES
(1, 1, 1, 189.90),
(1, 2, 1, 24.90),
(2, 4, 1, 34.50);
