# Makefile for Multi-tenant Serverless Agenda App

PROJECT_ID ?= lab-resources
REGION ?= us-central1
SERVICE_NAME = agenda-app
BUCKET_NAME = $(PROJECT_ID)-assets

.PHONY: help install build test deploy-gcp local-be local-fe setup-gcp

help:
	@echo "Uso:"
	@echo "  make install    - Instala dependências (BE e FE)"
	@echo "  make build      - Gera o build do FE e move para o BE"
	@echo "  make local-be   - Roda o Backend na porta 8080"
	@echo "  make local-fe   - Roda o Frontend na porta 3000"
	@echo "  make deploy-gcp - Build completo e deploy no Cloud Run"
	@echo "  make setup-gcp  - Cria o bucket do GCS e ativa APIs"

install:
	cd backend && npm install
	cd frontend && npm install

build:
	cd frontend && npm run build
	rm -rf backend/public
	mkdir -p backend/public
	cp -r frontend/dist/* backend/public/

local-be:
	export GOOGLE_CLOUD_PROJECT=$(PROJECT_ID) && cd backend && npm run dev

local-fe:
	cd frontend && npm run dev

setup-gcp:
	gcloud services enable run.googleapis.com firestore.googleapis.com identitytoolkit.googleapis.com
	gsutil mb gs://$(BUCKET_NAME)

deploy-gcp: build
	gcloud config set project $(PROJECT_ID)
	cd backend && gcloud run deploy $(SERVICE_NAME) \
		--source . \
		--region $(REGION) \
		--allow-unauthenticated \
		--service-account 1094295943535-compute@developer.gserviceaccount.com \
		--set-secrets="SMTP_USER=SMTP_USER:latest,SMTP_PASS=SMTP_PASS:latest"

