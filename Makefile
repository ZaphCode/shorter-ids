db-up:
	docker compose up -d postgres

db-down:
	docker compose down

dev:
	npm run dev

test:
	npm test
