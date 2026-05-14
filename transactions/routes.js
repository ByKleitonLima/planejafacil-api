import express, { request, response } from 'express';
import admin from 'firebase-admin';
import { authenticateToken } from '../middlewares/authenticate-jwt.js';
import { TransactionController } from './controller.js';
import { validadeTransaction } from './validators/create-transaction.validator.js';

const app = express();
const transactionController = new TransactionController();

app.get('/',
    (request, response, next) => authenticateToken(request, response, next, admin.auth()),
    (request, response) => transactionController.findByUser(request, response)
);

app.get("/:uid",
    (request, response, next) => authenticateToken(request, response, next, admin.auth()),
    (request, response) => transactionController.findByUid(request, response)
);

app.post("/",
    (request, response, next) => authenticateToken(request, response, next, admin.auth()),
    (request, response, next) => validadeTransaction(request, response, next),
    (request, response) => transactionController.create(request, response)
);

app.patch("/:uid",
    (request, response, next) => authenticateToken(request, response, next, admin.auth()),
    (request, response, next) => validadeTransaction(request, response, next),
    (request, response) => transactionController.update(request, response)
);

app.delete("/:uid",
    (request, response, next) => authenticateToken(request, response, next, admin.auth()),
    (request, response) => transactionController.delete(request, response)
)

export const transactionsRouter = app;