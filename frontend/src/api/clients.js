// src/api/clients.js
import { API_BASE_URL } from "../config";

/**
 * Obtiene la lista de clientes (usuarios con role='cliente')
 * @returns {Promise<Array>} Arreglo de objetos cliente
 */
export async function getClients() {
  const resp = await fetch(`${API_BASE_URL}/users/clients`);
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.detail || "Error al obtener clientes");
  }
  return resp.json();
}

/**
 * Elimina un cliente por ID
 */
export async function deleteClient(id) {
  const resp = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
  });
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.detail || "Error al eliminar cliente");
  }
  return true;
}
