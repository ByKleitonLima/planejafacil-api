export class UserDoesntOwnTransactionError extends Error {

    constructor() {
        super("Usuário nao autorizado");
        this.name = "user-doesnt-own-transaction";
        this.code = 403;
    }

}