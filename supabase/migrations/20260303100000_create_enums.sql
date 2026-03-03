-- SIMP: Enums do domínio
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE user_role AS ENUM ('professor', 'psicologia', 'psicopedagogia', 'coordenacao', 'diretoria', 'admin');
CREATE TYPE intervention_status AS ENUM ('Aguardando', 'Em_Acompanhamento', 'Concluído');
CREATE TYPE psych_assessment_tipo AS ENUM ('Inicial', 'Reavaliação', 'Acompanhamento');
CREATE TYPE action_category AS ENUM ('Ações Internas', 'Acionar Família', 'Acionar Psicologia', 'Acionar Psicopedagogia', 'Equipe Multidisciplinar');
CREATE TYPE timeline_event_type AS ENUM ('assessment', 'psych', 'intervention', 'referral', 'family_contact', 'potencialidades_registradas', 'pei_atualizado');
CREATE TYPE critical_occurrence_status AS ENUM ('Em Tratativa', 'Resolvido');
CREATE TYPE document_category AS ENUM ('laudo', 'pei', 'outro');
CREATE TYPE document_type AS ENUM ('pdf', 'image', 'doc');
