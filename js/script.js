const modal = {
    open() {
       document.querySelector(`.modal-overlay`)
        .classList.add("active")
    },
    close() {
        modalActive =  document.querySelector(`.modal-overlay.active`)
        
        modalActive.classList.remove("active")
    }
}

/*
 #Somar as entradas
 #Somar as Saídas
 #Subtrair o valor das saídas pelas entradas
 #Assim eu tenho o total

 **********************************************
 1- adicionar uma seleção para Entrada ou Saída
*/

const Storage = {
    get() {
       return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    },
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    edit(index) {
        console.log(JSON.parse(localStorage.getItem("dev.finances:transactions",)))
    },

    incomes() {
        let income = 0
        Transaction.all.forEach((transaction) => {
            if(transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income
    },
    expenses() {
        let expense = 0
        Transaction.all.forEach((transaction) => {
            if(transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense
    },
    total() {
        return Transaction.incomes() + Transaction.expenses()
    },
}

const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),

    addTransaction(transaction, index) {
        let tr = document.createElement("tr")
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },

    edtiTransaction() {

    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
                <td class="description">${transaction.description}</td>
                <td class="${CSSclass}">${amount}</td>
                <td class="date">${transaction.date}</td>
                <td class="manipulationOfTransaction">
                    <a href="#" onclick="modal.open()" class="button">
                        <img id="edit" onclick="Transaction.edit(${index})" src="./assets/edit.svg" alt="Editar Transação">
                    </a>
                    
                    <img id="remove" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
                </td>
        `

        return html
    },

    updateBalance() {
        document
            .getElementById("incomeCard")
            .innerHTML = Utils.formatCurrency(Transaction.incomes()) 

        document
            .getElementById("expenseCard")
            .innerHTML= Utils.formatCurrency(Transaction.expenses())

        document
            .getElementById("totalCard")
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    },

}

const Utils = {
    formatAmount(value) {
        value = value * 100
        
        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {

        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value  = value.toLocaleString("pt-BR", {
            style: "currency", 
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    typeOfTransaction: document.querySelector("select#transactionOption"),
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    getValues() {
        return {
            typeOfTransaction: Form.typeOfTransaction.value,
            description: Form.description.value,
            amount: Form.amount.value, 
            date: Form.date.value,
        }
    },

    validateFields() {
        const { typeOfTransaction, description, amount, date} = Form.getValues()

        if (typeOfTransaction.trim() === "" ||
            description.trim() === "" || 
            amount.trim() === "" ||
            date.trim() === "") {
                //console.log(document.querySelector("#buttonSave"))
                throw new Error("Por favor, preencha todos os campos!")               
            }

    },

    formatValues() {
        let {typeOfTransaction, description, amount, date} = Form.getValues()

        if(typeOfTransaction == "expense") {
            amount = Utils.formatAmount("-"+ amount)
        } else {
            amount = Utils.formatAmount(amount)
             // console.log(amount)
        }

        date = Utils.formatDate(date)

        return {
            typeOfTransaction,
            description, 
            amount,
            date,
        }

    },

    clearFields() {
        Form.description.typeOfTransaction = ""
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    saveTransaction(transaction) {
        //console.log(transaction)
        Transaction.add(transaction)
    },

    submit(event) {
        event.preventDefault()

        try {
            //Verificar se todos os campos foram preenchidos
            
            Form.validateFields()

            //Formatar os dados
            const transaction = Form.formatValues()
            Form.saveTransaction(transaction)
            Form.clearFields()
            modal.close()

        } catch (error) {
            alert(error.message)
        }

    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()