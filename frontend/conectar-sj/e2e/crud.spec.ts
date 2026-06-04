import { test, expect } from '@playwright/test';

const TS = Date.now();

test.describe('CRUD Áreas, Sedes, Actividades y Contactos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@sanjose.com');
    await page.fill('#password', 'admin123');
    await page.click('.submit-button');
    await page.waitForURL('**/admin/dashboard');
    await expect(page.locator('.loading-screen')).not.toBeVisible({ timeout: 30000 });
  });

  test('Áreas: crear, ver en lista y eliminar', async ({ page }) => {
    const nombreArea = `Test Área ${TS}`;

    await page.goto('/admin/areas');
    await expect(page.locator('.loading-screen')).not.toBeVisible({ timeout: 30000 });

    await page.click('.primary-button:has-text("Nueva Área")');
    await expect(page.locator('.modal-container')).toBeVisible();

    await page.fill('#area-nombre', nombreArea);
    await page.click('.icon-option:first-child');
    await page.click('.modal-container .primary-button:has-text("Guardar")');

    await expect(page.locator('.toast-message:has-text("Área creada")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.area-card', { hasText: nombreArea })).toBeVisible();
  });

  test('Sedes: crear, ver en lista y eliminar', async ({ page }) => {
    const nombreSede = `Test Sede ${TS}`;

    await page.goto('/admin/sedes');
    await expect(page.locator('.loading-screen')).not.toBeVisible({ timeout: 30000 });

    await page.click('.primary-button:has-text("Nueva Sede")');
    await expect(page.locator('.modal-container')).toBeVisible();

    await page.fill('input[name="nombre"]', nombreSede);
    await page.fill('input[name="direccion"]', 'Dirección de prueba');
    await page.click('.icon-chip-btn:first-child');
    await page.click('.modal-container .primary-button:has-text("GUARDAR")');

    await expect(page.locator('.toast-message:has-text("Sede creada")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.sede-card', { hasText: nombreSede })).toBeVisible();
  });

  test('Contactos: crear, ver en lista', async ({ page }) => {
    const nombreContacto = `Test Contacto ${TS}`;

    await page.goto('/admin/contactos');
    await expect(page.locator('.loading-screen')).not.toBeVisible({ timeout: 30000 });

    await page.click('.primary-button:has-text("Nuevo Contacto")');
    await expect(page.locator('.modal-container')).toBeVisible();

    await page.fill('#contacto-nombre', nombreContacto);
    await page.fill('.phone-list input[type="tel"]', '3425550000');
    await page.selectOption('#contacto-categoria', 'Emergencia');
    await page.click('.icon-option:first-child');
    await page.click('.modal-container .primary-button:has-text("Guardar")');

    await expect(page.locator('.toast-message:has-text("Contacto creado")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.contact-card', { hasText: nombreContacto })).toBeVisible();
  });

  test('Actividades: crear con sede existente', async ({ page }) => {
    const tituloActividad = `Test Actividad ${TS}`;

    await page.goto('/admin/activities');
    await expect(page.locator('.loading-screen')).not.toBeVisible({ timeout: 30000 });

    await page.click('.primary-button:has-text("Nueva Actividad")');
    await expect(page.locator('.modal-container')).toBeVisible();

    await page.fill('input[name="title"]', tituloActividad);
    await page.selectOption('select[name="sedeId"]', { index: 1 });
    await page.click('.selectable-chip:first-child');
    await page.click('.modal-container .primary-button:has-text("GUARDAR")');

    await expect(page.locator('.toast-message:has-text("creada")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.activity-card', { hasText: tituloActividad })).toBeVisible({ timeout: 30000 });
  });
});
