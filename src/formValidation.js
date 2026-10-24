const areaCodes = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35,
  37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64,
  65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88,
  89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

export function validPhone(value) {
  const text = String(value).trim();
  if (!/^[+0-9\s()\-]+$/u.test(text)) return false;
  let digits = text.replace(/\D/g, "");
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55"))
    digits = digits.slice(2);
  return (
    areaCodes.has(Number(digits.slice(0, 2))) &&
    /^[1-9]{2}(?:9[0-9]{8}|[2-5][0-9]{7})$/.test(digits)
  );
}

export function validateField(field) {
  if (!field?.setCustomValidity) return;
  field.setCustomValidity("");
  if (field.name === "data" && field.value && [0, 6].includes(new Date(`${field.value}T12:00:00`).getDay())) {
    field.setCustomValidity("Não há expediente aos sábados e domingos. Escolha uma data de segunda a sexta-feira.");
  } else if (field.name === "telefone" && field.value && !validPhone(field.value)) {
    field.setCustomValidity(
      "Informe um telefone válido com DDD, como (11) 91234-5678.",
    );
  } else if (
    field.required &&
    /^(text|textarea)$/.test(field.type) &&
    !field.value.trim()
  ) {
    field.setCustomValidity(
      "Preencha este campo com texto, não apenas espaços.",
    );
  }
}

// Capture runs before the calendar bridge's native submit listener.
export function validateBeforeSubmit(event) {
  const form = event.currentTarget;
  for (const field of form.elements) {
    validateField(field);
    if (/^(text|tel|textarea)$/.test(field.type))
      field.value = field.value.trim();
  }
  if (!form.reportValidity()) {
    event.preventDefault();
    event.stopPropagation();
  }
}
