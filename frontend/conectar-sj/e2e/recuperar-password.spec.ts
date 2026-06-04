import { test, expect } from '@playwright/test';

test.describe('Recuperar contraseña', () => {

  test('sin token muestra solicitar nuevo enlace', async ({ page }) => {
    await page.goto('/recuperar-password');

    await expect(page.locator('.error-state')).toBeVisible();
    await expect(page.locator('.error-icon:has-text("link_off")')).toBeVisible();
    await expect(page.locator('.error-state p')).toContainText('no es válido');

    const solicitarLink = page.locator('.submit-button:has-text("Solicitar nuevo enlace")');
    await expect(solicitarLink).toBeVisible();
    await expect(solicitarLink).toHaveAttribute('href', '/forgot-password');

    const volverLink = page.locator('.back-link:has-text("Volver")');
    await expect(volverLink).toBeVisible();
    await expect(volverLink).toHaveAttribute('href', '/login');
  });

  test('error en formulario muestra el link a solicitar nuevo enlace', async ({ page }) => {
    await page.goto('/recuperar-password?token=token-valido');

    await expect(page.locator('.form')).toBeVisible();

    await page.locator('#password').fill('12345');
    await page.locator('#confirmPassword').fill('12345');
    await page.locator('.submit-button').click();

    await expect(page.locator('.error-message')).toContainText('6 caracteres');

    const solicitarLink = page.locator('.back-link:has-text("Solicitar nuevo enlace")');
    await expect(solicitarLink).toBeVisible();
    await expect(solicitarLink).toHaveAttribute('href', '/forgot-password');
  });

  test('con contraseñas que no coinciden muestra error de validación', async ({ page }) => {
    await page.goto('/recuperar-password?token=token-valido');

    await page.locator('#password').fill('MiPass123');
    await page.locator('#confirmPassword').fill('OtraPass456');
    await page.locator('.submit-button').click();

    await expect(page.locator('.error-message')).toContainText('no coinciden');
  });

  test('campos vacíos muestra error de validación', async ({ page }) => {
    await page.goto('/recuperar-password?token=token-valido');

    await page.locator('.submit-button').click();

    await expect(page.locator('.error-message')).toContainText('Completá ambos campos');
  });
});
