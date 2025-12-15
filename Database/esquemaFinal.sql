--
-- PostgreSQL database dump
--

\restrict SYLQvhitefn0lfCCJorHshu3Ah3zkxcyhCGnjDiEIjxoiar694Ve23g16P7AmcA

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: documentos_academicos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documentos_academicos (
    id integer NOT NULL,
    id_personal integer NOT NULL,
    tipo character varying(50) NOT NULL,
    archivo text NOT NULL,
    fecha_subida timestamp without time zone DEFAULT now(),
    es_certificado boolean DEFAULT false,
    cotejado boolean DEFAULT false,
    verificado_por integer,
    fecha_verificacion timestamp without time zone
);


ALTER TABLE public.documentos_academicos OWNER TO postgres;

--
-- Name: documentos_academicos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.documentos_academicos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documentos_academicos_id_seq OWNER TO postgres;

--
-- Name: documentos_academicos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.documentos_academicos_id_seq OWNED BY public.documentos_academicos.id;


--
-- Name: grupo_miembros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grupo_miembros (
    id_miembro integer NOT NULL,
    id_grupo integer NOT NULL,
    id_personal integer NOT NULL,
    fecha_asignacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.grupo_miembros OWNER TO postgres;

--
-- Name: grupo_miembros_id_miembro_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grupo_miembros_id_miembro_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.grupo_miembros_id_miembro_seq OWNER TO postgres;

--
-- Name: grupo_miembros_id_miembro_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grupo_miembros_id_miembro_seq OWNED BY public.grupo_miembros.id_miembro;


--
-- Name: grupos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grupos (
    id_grupo integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    id_supervisor integer,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    activo boolean DEFAULT true
);


ALTER TABLE public.grupos OWNER TO postgres;

--
-- Name: grupos_id_grupo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grupos_id_grupo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.grupos_id_grupo_seq OWNER TO postgres;

--
-- Name: grupos_id_grupo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grupos_id_grupo_seq OWNED BY public.grupos.id_grupo;


--
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificaciones (
    id integer NOT NULL,
    id_personal integer,
    mensaje text NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    leido boolean DEFAULT false,
    usuario text
);


ALTER TABLE public.notificaciones OWNER TO postgres;

--
-- Name: notificaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notificaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notificaciones_id_seq OWNER TO postgres;

--
-- Name: notificaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notificaciones_id_seq OWNED BY public.notificaciones.id;


--
-- Name: personal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal (
    id_personal integer NOT NULL,
    nombre character varying(50) NOT NULL,
    apellido_paterno character varying(50) NOT NULL,
    apellido_materno character varying(50),
    usuario character varying(30) NOT NULL,
    contrasena character varying(255) NOT NULL,
    correo character varying(100) NOT NULL,
    curp character(18) NOT NULL,
    rfc character(13) NOT NULL,
    rol integer DEFAULT 1 NOT NULL,
    foto_perfil character varying(255),
    status boolean DEFAULT true,
    estudios character varying(50)
);


ALTER TABLE public.personal OWNER TO postgres;

--
-- Name: COLUMN personal.rol; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.personal.rol IS 'Tipo de usuario: 1=Trabajador, 2=Subjefe, 3=Jefe';


--
-- Name: COLUMN personal.estudios; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.personal.estudios IS 'Máximo grado de estudios: Primaria, Secundaria, Preparatoria, Licenciatura, Maestría, Doctorado, prefiero no decirlo';


--
-- Name: personal_id_personal_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_id_personal_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_id_personal_seq OWNER TO postgres;

--
-- Name: personal_id_personal_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_id_personal_seq OWNED BY public.personal.id_personal;


--
-- Name: documentos_academicos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documentos_academicos ALTER COLUMN id SET DEFAULT nextval('public.documentos_academicos_id_seq'::regclass);


--
-- Name: grupo_miembros id_miembro; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grupo_miembros ALTER COLUMN id_miembro SET DEFAULT nextval('public.grupo_miembros_id_miembro_seq'::regclass);


--
-- Name: grupos id_grupo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grupos ALTER COLUMN id_grupo SET DEFAULT nextval('public.grupos_id_grupo_seq'::regclass);


--
-- Name: notificaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones ALTER COLUMN id SET DEFAULT nextval('public.notificaciones_id_seq'::regclass);


--
-- Name: personal id_personal; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal ALTER COLUMN id_personal SET DEFAULT nextval('public.personal_id_personal_seq'::regclass);


--
-- Name: documentos_academicos documentos_academicos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documentos_academicos
    ADD CONSTRAINT documentos_academicos_pkey PRIMARY KEY (id);


--
-- Name: grupo_miembros grupo_miembros_id_grupo_id_personal_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grupo_miembros
    ADD CONSTRAINT grupo_miembros_id_grupo_id_personal_key UNIQUE (id_grupo, id_personal);


--
-- Name: grupo_miembros grupo_miembros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grupo_miembros
    ADD CONSTRAINT grupo_miembros_pkey PRIMARY KEY (id_miembro);


--
-- Name: grupos grupos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grupos
    ADD CONSTRAINT grupos_nombre_key UNIQUE (nombre);


--
-- Name: grupos grupos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grupos
    ADD CONSTRAINT grupos_pkey PRIMARY KEY (id_grupo);


--
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (id);


--
-- Name: personal personal_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal
    ADD CONSTRAINT personal_correo_key UNIQUE (correo);


--
-- Name: personal personal_curp_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal
    ADD CONSTRAINT personal_curp_key UNIQUE (curp);


--
-- Name: personal personal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal
    ADD CONSTRAINT personal_pkey PRIMARY KEY (id_personal);


--
-- Name: personal personal_rfc_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal
    ADD CONSTRAINT personal_rfc_key UNIQUE (rfc);


--
-- Name: personal personal_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal
    ADD CONSTRAINT personal_usuario_key UNIQUE (usuario);


--
-- Name: idx_grupo_miembros_grupo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grupo_miembros_grupo ON public.grupo_miembros USING btree (id_grupo);


--
-- Name: idx_grupo_miembros_personal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grupo_miembros_personal ON public.grupo_miembros USING btree (id_personal);


--
-- Name: idx_grupos_supervisor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grupos_supervisor ON public.grupos USING btree (id_supervisor);


--
-- Name: documentos_academicos documentos_academicos_id_personal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documentos_academicos
    ADD CONSTRAINT documentos_academicos_id_personal_fkey FOREIGN KEY (id_personal) REFERENCES public.personal(id_personal);


--
-- Name: documentos_academicos documentos_academicos_verificado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documentos_academicos
    ADD CONSTRAINT documentos_academicos_verificado_por_fkey FOREIGN KEY (verificado_por) REFERENCES public.personal(id_personal);


--
-- Name: grupo_miembros grupo_miembros_id_grupo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grupo_miembros
    ADD CONSTRAINT grupo_miembros_id_grupo_fkey FOREIGN KEY (id_grupo) REFERENCES public.grupos(id_grupo) ON DELETE CASCADE;


--
-- Name: grupo_miembros grupo_miembros_id_personal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grupo_miembros
    ADD CONSTRAINT grupo_miembros_id_personal_fkey FOREIGN KEY (id_personal) REFERENCES public.personal(id_personal) ON DELETE CASCADE;


--
-- Name: grupos grupos_id_supervisor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grupos
    ADD CONSTRAINT grupos_id_supervisor_fkey FOREIGN KEY (id_supervisor) REFERENCES public.personal(id_personal) ON DELETE SET NULL;


--
-- Name: notificaciones notificaciones_id_personal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_id_personal_fkey FOREIGN KEY (id_personal) REFERENCES public.personal(id_personal);


--
-- PostgreSQL database dump complete
--

\unrestrict SYLQvhitefn0lfCCJorHshu3Ah3zkxcyhCGnjDiEIjxoiar694Ve23g16P7AmcA

