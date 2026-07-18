-- =====================================================
-- Povoamento adicional: 10 funcionarios, 23 tutores, 35 pets
-- =====================================================

INSERT INTO funcionario (nome, cpf, cargo, data_contratacao) VALUES
('Camila Rodrigues Assis', '700.200.100-01', 'Veterinaria', '2021-03-10'),
('Marcos Vinicius Teles', '700.200.100-02', 'Tosador', '2022-05-14'),
('Debora Santana Farias', '700.200.100-03', 'Atendente', '2023-01-20'),
('Felipe Augusto Moreira', '700.200.100-04', 'Veterinario', '2021-09-05'),
('Tatiane Borges Ramos', '700.200.100-05', 'Tosadora', '2022-11-30'),
('Igor Nascimento Alves', '700.200.100-06', 'Atendente', '2023-04-12'),
('Luciana Prado Vasconcelos', '700.200.100-07', 'Veterinaria', '2020-08-18'),
('Bruno Henrique Cordeiro', '700.200.100-08', 'Tosador', '2022-02-25'),
('Sabrina Melo Cunha', '700.200.100-09', 'Atendente', '2023-07-01'),
('Rafael Cunha Barros', '700.200.100-10', 'Veterinario', '2021-12-15')
ON CONFLICT (cpf) DO NOTHING;

INSERT INTO tutor (nome, cpf, telefone, email, endereco) VALUES
('Roberto Silva Nunes', '700.300.100-01', '(33) 99801-0001', 'roberto.nunes@email.com', 'Rua Minas Gerais, 12'),
('Patricia Gomes Rocha', '700.300.100-02', '(33) 99801-0002', 'patricia.rocha@email.com', 'Rua Sao Paulo, 45'),
('Fernando Augusto Reis', '700.300.100-03', '(33) 99801-0003', 'fernando.reis@email.com', 'Av. Governador Valadares, 200'),
('Camila Andrade Pires', '700.300.100-04', '(33) 99801-0004', 'camila.pires@email.com', 'Rua Rio de Janeiro, 88'),
('Ricardo Barbosa Teixeira', '700.300.100-05', '(33) 99801-0005', 'ricardo.teixeira@email.com', 'Rua Espirito Santo, 15'),
('Beatriz Almeida Cardoso', '700.300.100-06', '(33) 99801-0006', 'beatriz.cardoso@email.com', 'Rua Bahia, 320'),
('Eduardo Martins Freitas', '700.300.100-07', '(33) 99801-0007', 'eduardo.freitas@email.com', 'Av. Brasil, 501'),
('Larissa Correia Vieira', '700.300.100-08', '(33) 99801-0008', 'larissa.vieira@email.com', 'Rua Parana, 77'),
('Gustavo Henrique Santos', '700.300.100-09', '(33) 99801-0009', 'gustavo.santos@email.com', 'Rua Ceara, 63'),
('Renata Oliveira Duarte', '700.300.100-10', '(33) 99801-0010', 'renata.duarte@email.com', 'Rua Pernambuco, 29'),
('Thiago Costa Ribeiro', '700.300.100-11', '(33) 99801-0011', 'thiago.ribeiro@email.com', 'Rua Santa Catarina, 141'),
('Vanessa Lopes Moura', '700.300.100-12', '(33) 99801-0012', 'vanessa.moura@email.com', 'Rua Amazonas, 8'),
('Rodrigo Pereira Farias', '700.300.100-13', '(33) 99801-0013', 'rodrigo.farias@email.com', 'Rua Goias, 92'),
('Aline Souza Cavalcante', '700.300.100-14', '(33) 99801-0014', 'aline.cavalcante@email.com', 'Rua Piaui, 54'),
('Marcelo Dias Nogueira', '700.300.100-15', '(33) 99801-0015', 'marcelo.nogueira@email.com', 'Rua Maranhao, 33'),
('Juliana Castro Brandao', '700.300.100-16', '(33) 99801-0016', 'juliana.brandao@email.com', 'Rua Alagoas, 19'),
('Diego Fernandes Araujo', '700.300.100-17', '(33) 99801-0017', 'diego.araujo@email.com', 'Rua Sergipe, 71'),
('Priscila Rezende Matos', '700.300.100-18', '(33) 99801-0018', 'priscila.matos@email.com', 'Rua Paraiba, 105'),
('Leonardo Batista Guimaraes', '700.300.100-19', '(33) 99801-0019', 'leonardo.guimaraes@email.com', 'Rua Tocantins, 47'),
('Cristiane Monteiro Lacerda', '700.300.100-20', '(33) 99801-0020', 'cristiane.lacerda@email.com', 'Rua Roraima, 22'),
('Andre Luiz Peixoto', '700.300.100-21', '(33) 99801-0021', 'andre.peixoto@email.com', 'Rua Amapa, 60'),
('Simone Carvalho Bezerra', '700.300.100-22', '(33) 99801-0022', 'simone.bezerra@email.com', 'Rua Acre, 38'),
('Vinicius Rodrigues Sales', '700.300.100-23', '(33) 99801-0023', 'vinicius.sales@email.com', 'Rua Rondonia, 14')
ON CONFLICT (cpf) DO NOTHING;

INSERT INTO pet (id_tutor, nome, especie, raca, data_nascimento, peso)
SELECT id_tutor, v.nome, v.especie, v.raca, v.data_nascimento::date, v.peso::decimal(5,2)
FROM tutor t
JOIN (VALUES
  ('700.300.100-01', 'Bidu', 'Cachorro', 'Vira-lata', '2020-02-10', '14.50'),
  ('700.300.100-01', 'Amora', 'Gato', 'Vira-lata', '2022-06-01', '3.90'),
  ('700.300.100-02', 'Fred', 'Cachorro', 'Poodle', '2021-04-15', '6.20'),
  ('700.300.100-03', 'Lola', 'Gato', 'Angora', '2019-11-03', '4.10'),
  ('700.300.100-03', 'Zeus', 'Cachorro', 'Pastor Alemao', '2020-08-22', '32.00'),
  ('700.300.100-04', 'Mel', 'Cachorro', 'Shih Tzu', '2023-01-05', '5.40'),
  ('700.300.100-05', 'Toby', 'Cachorro', 'Beagle', '2021-07-19', '11.30'),
  ('700.300.100-06', 'Luna', 'Gato', 'Siames', '2022-09-12', '3.60'),
  ('700.300.100-06', 'Simba', 'Gato', 'Persa', '2021-03-08', '4.80'),
  ('700.300.100-07', 'Bob', 'Cachorro', 'Golden Retriever', '2020-05-30', '29.00'),
  ('700.300.100-08', 'Nina', 'Cachorro', 'Yorkshire', '2023-02-14', '2.80'),
  ('700.300.100-09', 'Max', 'Cachorro', 'Labrador', '2019-12-01', '27.50'),
  ('700.300.100-10', 'Pandora', 'Gato', 'Maine Coon', '2021-10-25', '6.90'),
  ('700.300.100-11', 'Duke', 'Cachorro', 'Rottweiler', '2020-06-17', '38.00'),
  ('700.300.100-12', 'Bella', 'Cachorro', 'Poodle', '2022-04-09', '5.90'),
  ('700.300.100-12', 'Mimi', 'Gato', 'Vira-lata', '2023-05-20', '3.30'),
  ('700.300.100-13', 'Thor', 'Cachorro', 'Bulldog Ingles', '2021-01-11', '24.00'),
  ('700.300.100-14', 'Preta', 'Cachorro', 'Vira-lata', '2020-09-14', '16.70'),
  ('700.300.100-15', 'Salem', 'Gato', 'Preto Vira-lata', '2022-12-02', '4.20'),
  ('700.300.100-16', 'Kiara', 'Cachorro', 'Border Collie', '2021-05-28', '19.50'),
  ('700.300.100-17', 'Chico', 'Cachorro', 'Vira-lata', '2019-07-07', '15.10'),
  ('700.300.100-18', 'Nala', 'Gato', 'Siames', '2023-03-16', '3.70'),
  ('700.300.100-18', 'Simba II', 'Gato', 'Vira-lata', '2022-08-09', '4.40'),
  ('700.300.100-19', 'Apollo', 'Cachorro', 'Husky Siberiano', '2020-11-23', '23.80'),
  ('700.300.100-20', 'Fifi', 'Cachorro', 'Poodle', '2021-02-04', '4.90'),
  ('700.300.100-21', 'Buddy', 'Cachorro', 'Vira-lata', '2022-01-18', '13.20'),
  ('700.300.100-22', 'Perola', 'Gato', 'Angora', '2020-10-06', '3.80'),
  ('700.300.100-22', 'Odin', 'Cachorro', 'Pastor Belga', '2021-08-13', '28.60'),
  ('700.300.100-23', 'Mocha', 'Gato', 'Vira-lata', '2023-06-27', '3.10'),
  ('700.300.100-02', 'Belinha', 'Cachorro', 'Vira-lata', '2022-03-30', '9.40'),
  ('700.300.100-04', 'Trovao', 'Cachorro', 'Dobermann', '2020-04-02', '34.50'),
  ('700.300.100-05', 'Sofia', 'Gato', 'Ragdoll', '2021-09-09', '5.00'),
  ('700.300.100-07', 'Pipoca', 'Cachorro', 'Lhasa Apso', '2023-04-21', '4.60'),
  ('700.300.100-09', 'Estrela', 'Gato', 'Vira-lata', '2022-07-15', '3.50'),
  ('700.300.100-11', 'Rex II', 'Cachorro', 'Fila Brasileiro', '2019-05-19', '40.20')
) AS v(cpf_tutor, nome, especie, raca, data_nascimento, peso)
  ON t.cpf = v.cpf_tutor
WHERE NOT EXISTS (
  SELECT 1 FROM pet p2 WHERE p2.id_tutor = t.id_tutor AND p2.nome = v.nome
);
