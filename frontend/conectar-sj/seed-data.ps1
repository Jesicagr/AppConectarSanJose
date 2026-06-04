$api = "http://localhost:8080/api"

function Get-Areas {
  try { return Invoke-RestMethod -Uri "$api/areas" -Method Get } catch { return @() }
}

function Get-Sedes {
  try { return Invoke-RestMethod -Uri "$api/sedes" -Method Get } catch { return @() }
}

function Ensure-Area($nombre, $icono) {
  $existing = (Get-Areas) | Where-Object { $_."nombre" -eq $nombre }
  if ($existing) { Write-Host "  Area ya existe: $nombre (id=$($existing.id))" ; return $existing.id }
  $body = @{ nombre = $nombre; icono = $icono } | ConvertTo-Json
  $result = Invoke-RestMethod -Uri "$api/areas" -Method Post -Body $body -ContentType "application/json"
  Write-Host "  Area creada: $nombre (id=$($result.id))"
  return $result.id
}

function Ensure-Sede($nombre, $direccion, $descripcion, $icono) {
  $existing = (Get-Sedes) | Where-Object { $_."nombre" -eq $nombre }
  if ($existing) { Write-Host "  Sede ya existe: $nombre (id=$($existing.id))" ; return $existing.id }
  $body = @{
    nombre = $nombre
    direccion = $direccion
    descripcion = $descripcion
    icono = $icono
  } | ConvertTo-Json
  $result = Invoke-RestMethod -Uri "$api/sedes" -Method Post -Body $body -ContentType "application/json"
  Write-Host "  Sede creada: $nombre (id=$($result.id))"
  return $result.id
}

function Create-Actividad($titulo, $descripcion, $sedeId, $areaIds, $dia, $horario, $encargado) {
  if ($areaIds -isnot [array]) { $areaIds = @($areaIds) }
  $areasJson = ($areaIds | ForEach-Object { "{`"id`":$_}" }) -join ","
  $json = "{`"titulo`":`"$($titulo -replace '"','\"')`",`"descripcion`":`"$($descripcion -replace '"','\"')`",`"sede`":{`"id`":$sedeId},`"areas`":[$areasJson],`"dia`":`"$dia`",`"horario`":`"$horario`",`"encargado`":`"$encargado`",`"fechaInicio`":`"2026-01-01`",`"repetirTodoAnio`":true}"
  try {
    $result = Invoke-RestMethod -Uri "$api/actividades" -Method Post -Body $json -ContentType "application/json"
    Write-Host "    Actividad creada: $titulo"
  } catch {
    Write-Host "    ERROR al crear: $titulo - $_"
  }
}

Write-Host "=== INICIO SEED DATA ==="
Write-Host ""

# AREAS
Write-Host "--- CREANDO AREAS ---"
$areaMujeres = Ensure-Area "Mujeres Género y Diversidad" "female"
$areaNinez = Ensure-Area "Niñez, Adolescencia y Familia" "child_care"
$areaMayores = Ensure-Area "Personas Mayores" "elderly"
$areaComunitario = Ensure-Area "Desarrollo Comunitario" "diversity_3"
$areaInclusion = Ensure-Area "Discapacidad" "accessible"
$areaSalud = Ensure-Area "Salud Social y Comunitaria" "monitor_heart"
$areaTrabajo = Ensure-Area "Trabajo y Producción" "work"
$areaDeportes = Ensure-Area "Deportes y Recreación" "sports_soccer"
$areaCultura = Ensure-Area "Cultura" "theater_comedy"
$areaEducacion = Ensure-Area "Educación" "school"
Write-Host ""

# SEDE 1: Oficina Centenario 2180/2178
Write-Host "--- SEDE: Oficina Centenario ---"
$sedeCentenario = Ensure-Sede "Oficinas Centrales (Centenario 2180/2178)" "Centenario 2180 / 2178" "Oficinas Centrales de la Municipalidad" "business"
Create-Actividad "Espacios de Escucha" "Atencion de lunes a viernes" $sedeCentenario $areaMujeres "Lunes a viernes" "7:00 a 17:00 h"
Create-Actividad "Trabajo Territorial y Equipo Interdisciplinario" "" $sedeCentenario $areaMujeres "Lunes a viernes" "7:00 a 13:00 h"
Create-Actividad "Espacio Psicoterapeutico" "" $sedeCentenario $areaMujeres "Martes y jueves" "Martes 8:00-10:00 / Jueves 10:00-12:00"
Create-Actividad "Destejer Masculinidades" "En Centenario 2178" $sedeCentenario $areaMujeres "Miercoles" "16:00 a 19:00 h"
Create-Actividad "Atencion en Oficina - Tramites" "Tramites y consultas generales" $sedeCentenario $areaMayores "Lunes a viernes" "7:00 a 13:00 h"
Create-Actividad "Dispositivo de Acompaniamiento Gerontologico" "Demencias / Abusos" $sedeCentenario $areaMayores "Jueves" "10:00 a 12:00 h"
Create-Actividad "Atencion Profesional y Trabajo Social" "" $sedeCentenario $areaComunitario "Lunes y miercoles" "8:00 a 12:00 h"
Create-Actividad "Asesoramiento ANSES" "" $sedeCentenario $areaComunitario "Lunes, martes, jueves y viernes" "8:00 a 12:00 h"
Create-Actividad "Atencion de Oficina y Asesoramiento" "CUD, pensiones, salud" $sedeCentenario $areaInclusion "Lunes a viernes" "8:00 a 12:00 h"
Create-Actividad "Junta Certificadora de Discapacidad" "" $sedeCentenario $areaInclusion "Jueves" "13:00 a 17:00 h"
Write-Host ""

# SEDE 2: CIC
Write-Host "--- SEDE: CIC Aurora Amable Santini ---"
$sedeCIC = Ensure-Sede "CIC Aurora Amable Santini" "Barrio El Brillante" "Centro Integrador Comunitario" "home_health"
Create-Actividad "Espacios de Escucha - CIC" "Con coordinacion previa" $sedeCIC $areaMujeres "A coordinar" "Con coordinacion previa"
Create-Actividad "Espacio Psicoterapeutico - CIC" "" $sedeCIC $areaMujeres "Miercoles" "9:00 a 13:00 h"
Create-Actividad "Destejer Masculinidades - CIC" "" $sedeCIC $areaMujeres "Lunes" "13:30 a 16:30 h"
Create-Actividad "Ronda / Encuentro de Mujeres" "" $sedeCIC $areaMujeres "Jueves" "10:30 h"
Create-Actividad "Espacios de Escucha - SJNAF" "" $sedeCIC $areaNinez "Lunes y miercoles" "Lunes 12:00-16:00 / Miercoles 8:00-13:00"
Create-Actividad "Trabajo Territorial - SJNAF" "" $sedeCIC $areaNinez "Miercoles y viernes" "7:00 a 13:00 h"
Create-Actividad "Talleres para Ninos" "Ritmos Latinos, Arte Terapia y Reciclado" $sedeCIC $areaNinez "" ""
Create-Actividad "Atencion Personas Mayores - CIC" "Atencion y demandas vinculadas a las vejeces" $sedeCIC $areaMayores "Lunes a viernes" "7:00 a 13:00 h"
Create-Actividad "Talleres Personas Mayores" "Gimnasia, Canto, Arte y Reciclado, Ritmos del Recuerdo, Yoga y Pilates" $sedeCIC $areaMayores "" ""
Create-Actividad "Atencion Trabajadora Social - CIC" "" $sedeCIC $areaComunitario "Viernes" "a partir de las 8:00 h"
Create-Actividad "Asesora de ANSES - CIC" "" $sedeCIC $areaComunitario "Miercoles" "8:00 a 12:00 h"
Create-Actividad "Comedor Comunitario - CIC" "Comedor general desde las 17:00 h" $sedeCIC $areaComunitario "Lunes a sabado" "Lun-Vie 14:00-20:00 / Sab 7:00-14:00"
Create-Actividad "Atencion de Oficina - Inclusion CIC" "" $sedeCIC $areaInclusion "Lunes a viernes" "8:00 a 12:00 h"
Create-Actividad "Taller de Deporte Adaptado - CIC" "" $sedeCIC $areaInclusion "Martes" "10:30 h"
Create-Actividad "Atencion Medica y Enfermeria - CAPS CIC" "Clinica, Odontologia, Obstetricia, Pediatria, Nutricion, Psicologia, Puericultura" $sedeCIC $areaSalud "Lunes a viernes" "7:00 a 18:00 h"
Create-Actividad "Atencion SEDRONAR" "Consumos problematicos" $sedeCIC $areaSalud "Jueves" "8:00 a 16:00 h"
Create-Actividad "Taller de MaPaternidad (Preparto)" "" $sedeCIC $areaSalud "Jueves" "11:00 a 13:00 h"
Create-Actividad "Espacio TRAMA ANAF" "Acompaniamiento a adolescentes madres/padres" $sedeCIC $areaSalud "Martes" "9:30 a 11:30 h"
Create-Actividad "Apoyo Escolar Primaria 1 y 2 Grado" "" $sedeCIC $areaEducacion "Miercoles" "8:30 a 10:00 h"
Create-Actividad "Apoyo Escolar Primaria 3 a 6 Grado" "" $sedeCIC $areaEducacion "Lunes, miercoles y viernes" "16:30 a 18:30 h"
Create-Actividad "Apoyo Escolar Secundaria" "Educ. en Movimiento 1 y 2 anio" $sedeCIC $areaEducacion "Lunes y viernes" "9:00 a 11:00 h"
Create-Actividad "Educacion de Jovenes y Adultos" "Escuela Primaria" $sedeCIC $areaEducacion "Lunes a viernes" "13:00 a 16:30 h"
Create-Actividad "Escuela de Oficios" "Cursos de Modisto y Estampador Grafico" $sedeCIC $areaEducacion "" ""
Create-Actividad "Talleres de Percusion" "" $sedeCIC $areaCultura "Martes" "16:00 h"
Create-Actividad "Coro Provincial" "" $sedeCIC $areaCultura "Lunes y jueves" "16:00 a 18:30 h"
Create-Actividad "Atencion Veterinaria" "" $sedeCIC $areaSalud "Lunes a viernes" "13:00 a 19:00 h"
Write-Host ""

# SEDE 3: CAPS Guiffre
Write-Host "--- SEDE: CAPS Osvaldo Guiffre ---"
$sedeGuiffre = Ensure-Sede "CAPS Osvaldo Guiffre" "Barrio Perucho Verne" "Centro de Atencion Primaria de la Salud" "local_hospital"
Create-Actividad "Atencion Primaria - Guiffre" "Vacunacion, Pediatria, Nutricion, Clinica, Obstetricia, Puericultura, Psicologia" $sedeGuiffre $areaSalud "Lunes a viernes" "7:00 a 13:00 h"
Create-Actividad "Comedor Comunitario - Guiffre" "" $sedeGuiffre $areaComunitario "Lunes a viernes" "a partir de las 17:00 h"
Write-Host ""

# SEDE 4: CAPS Tavella
Write-Host "--- SEDE: CAPS Dr. Nicolas Tavella ---"
$sedeTavella = Ensure-Sede "CAPS Dr. Nicolas Tavella" "Barrio El Colorado" "Centro de Atencion Primaria de la Salud" "local_hospital"
Create-Actividad "Atencion Primaria - Tavella" "Vacunacion, Pediatria, Psicologia, Obstetricia, Clinica, Odontologia, Nutricion, Puericultura" $sedeTavella $areaSalud "Lunes a viernes" "7:00 a 18:00 h"
Create-Actividad "Ritmos Latinos - Tavella" "Taller barrial" $sedeTavella $areaNinez "" ""
Create-Actividad "Taller Ludico Recreativo - Tavella" "" $sedeTavella $areaNinez "" ""
Write-Host ""

# SEDE 5: CAPS Barreto
Write-Host "--- SEDE: CAPS Araceli Barreto ---"
$sedeBarreto = Ensure-Sede "CAPS Araceli Barreto" "Barrio Loma Hermosa" "Centro de Atencion Primaria de la Salud" "local_hospital"
Create-Actividad "Atencion Primaria - Barreto" "Clinica, Pediatria, Puericultura, Obstetricia, Odontologia, Psicologia, Nutricion" $sedeBarreto $areaSalud "Lunes a viernes" "7:00 a 18:00 h"
Create-Actividad "Taller de Enfermedades Cronicas" "1 vez al mes (consultar por WhatsApp)" $sedeBarreto $areaSalud "1 vez al mes" ""
Create-Actividad "Taller de Salud Mental" "" $sedeBarreto $areaSalud "" ""
Create-Actividad "Espacio Psicoterapeutico - Barreto" "" $sedeBarreto $areaMujeres "Lunes" "8:00 a 12:00 h"
Write-Host ""

# SEDE 6: Casa del Bicentenario
Write-Host "--- SEDE: Casa del Bicentenario ---"
$sedeBicentenario = Ensure-Sede "Casa del Bicentenario" "San Martin 1171" "Espacio cultural municipal" "theater_comedy"
Create-Actividad "Oficina de atencion - Cultura" "" $sedeBicentenario $areaCultura "Lunes a viernes" "7:00 a 13:00 h"
Create-Actividad "Talleres Artisticos Gratuitos" "Organo y piano, Percusion, Bateria, Teatro, Coro, Dibujo y Pintura, Folclore, Acordeon, Iniciacion Musical" $sedeBicentenario $areaCultura "" ""
Create-Actividad "Tardecitas Bailables" "Actividad recreativa inclusiva - una vez al mes" $sedeBicentenario $areaInclusion "1 vez al mes" ""
Write-Host ""

# SEDE 7: Polideportivo
Write-Host "--- SEDE: Polideportivo Municipal ---"
$sedePoli = Ensure-Sede "Polideportivo Municipal" "Yapeyu y Av. Mitre" "Instalaciones deportivas municipales" "sports_soccer"
Create-Actividad "Oficina de atencion - Deportes" "" $sedePoli $areaDeportes "Lunes a viernes" "7:00 a 13:00 h"
Create-Actividad "Gimnasia artistica" "" $sedePoli $areaDeportes "Lun-Mie 17:00 / Mar-Jue 18:00" ""
Create-Actividad "Mini Atletismo y Atletismo" "" $sedePoli $areaDeportes "Martes y jueves" "18:00 h"
Create-Actividad "Sanjo Corre" "" $sedePoli $areaDeportes "Martes y jueves" "20:00 h"
Create-Actividad "Newcom" "" $sedePoli $areaDeportes "Lun 18:30 / Mar-Jue 19:00" ""
Create-Actividad "Beach Voley" "" $sedePoli $areaDeportes "Martes" "14:00 h"
Create-Actividad "Taller de Deporte Adaptado - Polideportivo" "" $sedePoli $areaInclusion "Lunes y miercoles" "17:00 h"
Write-Host ""

# SEDE 8: Oficina Trabajo
Write-Host "--- SEDE: Oficina de Trabajo y Produccion ---"
$sedeTrabajo = Ensure-Sede "Oficina de Trabajo y Produccion" "Alejo Peyret y 25 de Mayo" "Oficina de servicios laborales y productivos" "work"
Create-Actividad "Atencion de oficina - Trabajo" "Entrevistas laborales, CV, base de datos, busquedas laborales, asesoramiento financiero/microcreditos" $sedeTrabajo $areaTrabajo "Lunes a viernes" "7:00 a 13:00 h"
Create-Actividad "Inscripcion R.E.N.A.P.A." "Registro Nacional de Productores Apicolas" $sedeTrabajo $areaTrabajo "" ""
Write-Host ""

# SEDE 9: Oficina Educacion
Write-Host "--- SEDE: Oficina de Educacion ---"
$sedeEducacion = Ensure-Sede "Oficina de Educacion" "Alejo Peyret 1180" "Oficina de gestion educativa municipal" "school"
Create-Actividad "Atencion de oficina - Educacion" "Inscripcion y gestion de becas, convenios universitarios, entrega de utiles escolares, inscripciones" $sedeEducacion $areaEducacion "Lunes a viernes" "8:00 a 14:00 h"
Write-Host ""

# SEDE 10: Cettour
Write-Host "--- SEDE: Sede Educativa Cettour ---"
$sedeCettour = Ensure-Sede "Sede Educativa Cettour N 1966" "" "Sede educativa municipal" "school"
Create-Actividad "Apoyo Escolar Municipal - Cettour" "" $sedeCettour $areaEducacion "Lunes, miercoles y viernes" "15:00 a 17:00 h"
Write-Host ""

# SEDE 11: Aula Satelital
Write-Host "--- SEDE: Aula Satelital ---"
$sedeAula = Ensure-Sede "Aula Satelital" "San Jose" "Aula educativa satelital" "school"
Create-Actividad "Apoyo Escolar Primaria - Aula Satelital" "" $sedeAula $areaEducacion "Lun-Mie 9:00-11:00 / Mar-Jue 15:00-17:00" ""
Write-Host ""

# SEDE 12: Sindicato
Write-Host "--- SEDE: Salon Sindicato Municipal ---"
$sedeSindicato = Ensure-Sede "Salon Sindicato Municipal" "" "Salon del sindicato municipal" "accessible"
Create-Actividad "Taller de Teatro Inclusivo" "" $sedeSindicato $areaInclusion "Jueves" "15:30 a 17:00 h"
Write-Host ""

# SEDE 13: El Paseito
Write-Host "--- SEDE: El Paseito ---"
$sedePaseito = Ensure-Sede "El Paseito" "San Martin y 9 de Julio" "Mercado de comercializacion para productores locales" "storefront"
Create-Actividad "Mercado de comercializacion" "Promocion y venta para productores, emprendedores, manualistas y artesanos locales" $sedePaseito $areaTrabajo "" ""
Write-Host ""

# SEDE 14: Huerta Comunitaria
Write-Host "--- SEDE: Huerta Comunitaria ---"
$sedeHuerta = Ensure-Sede "Huerta Comunitaria" "Ubicacion segun area" "Huerta comunitaria municipal" "park"
Create-Actividad "Huerta Comunitaria - Produccion" "Siembra, produccion de alimentos frescos, entrega de semillas y capacitaciones" $sedeHuerta $areaTrabajo "" ""
Write-Host ""

# SEDE 15: Termas
Write-Host "--- SEDE: Termas San Jose ---"
$sedeTermas = Ensure-Sede "Termas San Jose" "" "Complejo termal municipal" "spa"
Create-Actividad "Actividades Socio Recreativas - Termas" "Con profesora de educacion fisica, acompaniante terapeutica y enfermeria" $sedeTermas $areaMayores "Martes" "9:00 a 11:45 h"
Write-Host ""

# SEDE 16: HCD
Write-Host "--- SEDE: Salon HCD ---"
$sedeHCD = Ensure-Sede "Salon del Honorable Concejo Deliberante" "" "Salon del HCD" "account_balance"
Create-Actividad "Observatorio de Genero y DDHH" "Encuentros ciudadanos" $sedeHCD $areaMujeres "Segundo lunes de cada mes" "19:00 h"
Write-Host ""

# ACTIVIDADES ITINERANTES (SIN SEDE FIJA)
Write-Host ""
Write-Host "--- ACTIVIDADES ITINERANTES ---"
Write-Host ""

Write-Host "--- Actividades del Area Ninez, Adolescencia y Familia (SJNAF) en Barrios ---"
Create-Actividad "Espacios de Escucha Barriales - Colorado, Teresita, Bernardo" "Cada 15 días (Lunes) en barrios El Colorado, Santa Teresita y San Bernardo." $sedeCIC $areaNinez "Lunes (cada 15 días)" ""
Create-Actividad "Espacios de Escucha Barriales - Perucho Verne, San Miguel" "Cada 15 días (Lunes) en barrios Perucho Verne y San Miguel." $sedeCIC $areaNinez "Lunes (cada 15 días)" ""
Create-Actividad "Trabajo Territorial de Diagnostico - Centro" "Martes y jueves (7:00 a 13:00 h) en San José centro." $sedeCIC $areaNinez "Martes y jueves" "7:00 a 13:00 h"
Create-Actividad "Trabajo Territorial de Diagnostico - Teresita, Colorado, Bernardo" "Dos lunes al mes en Santa Teresita, El Colorado y San Bernardo." $sedeCIC $areaNinez "Lunes (2 por mes)" ""
Create-Actividad "Trabajo Territorial de Diagnostico - San Miguel, Premat, Perucho" "Dos lunes al mes en San Miguel, Premat y Perucho." $sedeCIC $areaNinez "Lunes (2 por mes)" ""
Create-Actividad "Taller Crianza sin Violencia" "Taller de crianza sin violencia, dictado en barrios." $sedeCIC $areaNinez "" ""
Create-Actividad "Taller Trama Mapaternidades" "Taller de acompaniamiento a adolescentes madres y padres." $sedeCIC $areaNinez "" ""
Create-Actividad "Las Emociones en Juego" "Taller dictado en Clubes." $sedeCIC $areaNinez "" ""
Create-Actividad "Ritmos Latinos - Barrios" "En barrios El Colorado, El Brillante y San Miguel." $sedeCIC $areaNinez "" ""
Create-Actividad "Arte Terapia / Reciclado" "En El Brillante, San Miguel y San José centro." $sedeCIC $areaNinez "" ""
Create-Actividad "Mini Chef" "Dictado en San José centro." $sedeCentenario $areaNinez "" ""
Create-Actividad "Emociones para ninos y ninas" "Dictado en San José centro." $sedeCentenario $areaNinez "" ""
Create-Actividad "Construyendo Proyectos Adolescentes" "Dictado en San José centro." $sedeCentenario $areaNinez "" ""
Write-Host ""

Write-Host "--- Actividades Recreativas del Area de Deportes en Barrios ---"
Create-Actividad "Taller Recreativo Deportivo - Santa Teresita" "Lunes y miércoles a las 16:00 h en Barrio Santa Teresita." $sedePoli $areaDeportes "Lunes y miércoles" "16:00 h"
Create-Actividad "Voley - Barrio El Brillante" "Lunes y miércoles a las 16:00 h en Barrio El Brillante." $sedePoli $areaDeportes "Lunes y miércoles" "16:00 h"
Write-Host ""

Write-Host "--- Actividades de Asistencia Directa y Alimentos (Desarrollo Comunitario y Salud) ---"
Create-Actividad "Comedor Comunitario - Santa Teresita" "Opera de lunes a viernes desde las 17:00 h en Barrio Santa Teresita." $sedeCIC $areaComunitario "Lunes a viernes" "desde 17:00 h"
Create-Actividad "Comedor Comunitario - Perucho Verne" "Opera de lunes a viernes desde las 17:00 h en Barrio Perucho Verne." $sedeGuiffre $areaComunitario "Lunes a viernes" "desde 17:00 h"
Create-Actividad "Entrega de Modulos Alimentarios" "Alimentos secos distribuidos en 4 puntos principales de la ciudad. Ordenes de alimentos especiales para celiacos o diabeticos." $sedeCentenario $areaComunitario "Lunes a viernes" ""
Create-Actividad "Asistencia de Emergencia" "Cobertura de sepelios, desagote de pozos, pasajes por salud, remises a hospitales provinciales, entrega directa de frazadas, colchones y zapatillas." $sedeCentenario $areaComunitario "24 horas" ""
Create-Actividad "Servicio de Rescate en la Via Publica" "Auxilio inmediato ante emergencias las 24 horas, los 365 dias del anio. Articulado por el area de Salud con Bomberos Voluntarios y Medicos de Guardia." $sedeCentenario $areaSalud "24 horas / 365 dias" ""
Write-Host ""

Write-Host "=== SEED DATA COMPLETADO ==="
