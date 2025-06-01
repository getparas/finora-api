import { sql } from "../config/db.js";
import logger from "../config/logger.js";

export async function getTransactionsByUserId(req, res) {
  try {
    const { userId } = req.params;
    const transactions =
      await sql`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC`;
    res.status(200).json(transactions);
  } catch (error) {
    logger.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function createTransaction(req, res) {
  try {
    const { title, amount, category, user_id } = req.body;
    if (!title || amount === undefined || !category || !user_id) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (typeof amount !== "number" || isNaN(amount)) {
      return res.status(400).json({ message: "Amount must be a number" });
    }
    const transaction = await sql`
      INSERT INTO transactions (user_id, title, amount, category)
      VALUES (${user_id}, ${title}, ${amount}, ${category})
      RETURNING *
    `;
    res.status(201).json(transaction[0]);
  } catch (error) {
    logger.error("Error creating transaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }
    const result =
      await sql`DELETE FROM transactions WHERE id = ${id} RETURNING *`;
    if (result.count === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(204).send();
  } catch (error) {
    logger.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getTransactionSummaryByUserId(req, res) {
  try {
    const { userId } = req.params;
    const balanceResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS balance FROM transactions WHERE user_id = ${userId}
    `;
    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS income FROM transactions WHERE user_id = ${userId} AND amount > 0
    `;
    const expenseResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS expenses FROM transactions WHERE user_id = ${userId} AND amount < 0
    `;
    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expenses: expenseResult[0].expenses,
    });
  } catch (error) {
    logger.error("Error fetching transaction summary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
