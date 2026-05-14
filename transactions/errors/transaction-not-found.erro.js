export class TransactionNotFoundError extends Error {

    constructor() {
        super("Transaçao nao informado");
        this.name = "transaction-uid-not-informed";
        this.code = 404;
    }

}