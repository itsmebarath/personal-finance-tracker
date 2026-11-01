const API_URL = "http://localhost:8080/api/budgets";

function getToken() {
return localStorage.getItem("token");
}

function getHeaders() {
const token = getToken();

return {
"Content-Type": "application/json",
...(token ? { Authorization: `Bearer ${token}` } : {}),
};
}

async function handleResponse(response) {
if (!response.ok) {
const error = await response.json().catch(() => ({}));


throw new Error(
  error.error || error.message || `Request failed: ${response.status}`
);


}

if (response.status === 204) {
return null;
}

return response.json();
}

export async function getBudgets(month, year) {
const response = await fetch(
`${API_URL}?month=${month}&year=${year}`,
{
method: "GET",
headers: getHeaders(),
}
);

return handleResponse(response);
}

export async function createBudget(budget) {
const response = await fetch(API_URL, {
method: "POST",
headers: getHeaders(),
body: JSON.stringify(budget),
});

return handleResponse(response);
}

export async function updateBudget(id, budget) {
const response = await fetch(`${API_URL}/${id}`, {
method: "PUT",
headers: getHeaders(),
body: JSON.stringify(budget),
});

return handleResponse(response);
}

export async function deleteBudget(id) {
const response = await fetch(`${API_URL}/${id}`, {
method: "DELETE",
headers: getHeaders(),
});

return handleResponse(response);
}
