"use strict";

const $ = id => document.getElementById(id);
let currentLanguage = localStorage.getItem("zero-language") === "es" ? "es" : "en";
const userRecordsKey = "firebank-demo-users";
function loadUserRecords() {
    try {
        const parsed = JSON.parse(localStorage.getItem(userRecordsKey) || "{}");
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? Object.assign(Object.create(null), parsed)
            : Object.create(null);
    } catch (error) {
        console.error("Unable to read demo account records from local storage.", error);
        return Object.create(null);
    }
}
const userRecords = loadUserRecords();
const userKey = username => username.trim().toLowerCase();
const emptyProfile = username => ({
    username: username || "", firstName: "", lastName: "", email: "", phone: "", birthDate: "",
    address: "", address2: "", city: "", region: "", postalCode: "", country: ""
});
function saveUserRecords() {
    localStorage.setItem(userRecordsKey, JSON.stringify(userRecords));
}
async function passwordDigest(password, salt) {
    if (!crypto.subtle) throw new Error("Secure password hashing is not available in this browser.");
    const key = await crypto.subtle.importKey(
        "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
    );
    const bytes = await crypto.subtle.deriveBits({
        name: "PBKDF2",
        hash: "SHA-256",
        salt: new TextEncoder().encode(salt),
        iterations: 120000
    }, key, 256);
    return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
}
function createPasswordSalt() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}
const rememberedUser = localStorage.getItem("zero-remembered-user");
const spanishText = {
    "Fire- Personal Banking": "Fire- Banca personal", "Put 'Username' in the username input and 'Password' in the password input to log in": "Pon 'Username' en el input de el nombre de usuario y 'Password' en el input contraseña para loguearte",
    "Personal Banking · Loans · Credit Cards": "Banca personal · Préstamos · Tarjetas de crédito",
    "Search...": "Buscar...", "Search all sections": "Buscar en todas las secciones", "Search": "Buscar",
    "Select language": "Seleccionar idioma", "Sign in": "Iniciar sesión", "Settings": "Configuración",
    "FireBank Home": "Inicio de FireBank", "Statement years": "Años de estados de cuenta",
    "Online Banking sections": "Secciones de banca en línea", "Help topics": "Índice de ayuda", "Dismiss message": "Descartar mensaje",
    "Interactive outflow pie chart": "Gráfico circular interactivo de gastos",
    "Account settings": "Configuración de la cuenta", "Privacy settings": "Configuración de privacidad",
    "Help": "Ayuda", "My profile": "Mi perfil", "Logout": "Cerrar sesión", "Home": "Inicio",
    "Online Banking": "Banca en línea", "Feedback": "Comentarios",
    "Banking made simple.": "La banca, más simple.",
    "Manage your accounts, review your checking account activity, keep track of your spending and explore your finances with convenient online banking tools. Everything you need to understand your money, all in one place.": "Administra tus cuentas, revisa los movimientos de tu cuenta corriente, controla tus gastos y explora tus finanzas con herramientas de banca en línea. Todo lo que necesitas para entender tu dinero, en un solo lugar.",
    "Access your accounts and manage your finances.": "Accede a tus cuentas y administra tus finanzas.",
    "Explore Online Banking →": "Explorar la banca en línea →", "Checking Account": "Cuenta corriente",
    "Check the transactions of your checking account.": "Revisa las transacciones de tu cuenta corriente.",
    "View Checking Account Activity →": "Ver movimientos de cuenta corriente →",
    "Move money between your demonstration accounts.": "Mueve dinero entre tus cuentas de demostración.",
    "Transfer Funds": "Transferir fondos", "Record sample payments and track your bills.": "Registra pagos de ejemplo y lleva el control de tus facturas.",
    "Pay Bills": "Pagar facturas", "Transfer Funds →": "Transferir fondos →", "Pay Bills →": "Pagar facturas →",
    "Online Banking Login": "Acceso a la banca en línea", "Sign in to access your account information.": "Inicia sesión para consultar la información de tu cuenta.",
    "Username": "Usuario", "Password": "Contraseña", "Keep me signed in": "Mantener mi sesión iniciada",
    "Create account": "Crear cuenta", "Create your account": "Crea tu cuenta",
    "Enter your details to create a local demo profile.": "Ingresa tus datos para crear un perfil de demostración local.",
    "First name": "Nombre", "Last name": "Apellido", "Email": "Correo electrónico", "Phone": "Teléfono",
    "Date of birth": "Fecha de nacimiento", "Street address": "Dirección", "Apartment, suite, etc. (optional)": "Apartamento, suite, etc. (opcional)",
    "City": "Ciudad", "State / province / region": "Estado / provincia / región", "Postal code": "Código postal",
    "Country": "País", "Confirm password": "Confirmar contraseña", "New password (optional)": "Nueva contraseña (opcional)",
    "Current password": "Contraseña actual", "Confirm new password": "Confirmar nueva contraseña",
    "Profile data is stored only in this browser for this demo and is not sent to a server.": "Los datos del perfil se guardan solo en este navegador para esta demostración y no se envían a ningún servidor.",
    "Already have an account? Sign in": "¿Ya tienes una cuenta? Inicia sesión",
    "Sign-in details": "Datos de acceso",
    "Preferences": "Preferencias", "Save account settings": "Guardar configuración de la cuenta",
    "Save preferences": "Guardar preferencias", "Email notifications": "Notificaciones por correo electrónico",
    "Security alerts": "Alertas de seguridad",
    "Personal information": "Información personal", "Save profile": "Guardar perfil",
    "Account created. Your demo session has started.": "Cuenta creada. Tu sesión de demostración está iniciada.",
    "That username is already in use.": "Ese nombre de usuario ya está en uso.",
    "Passwords do not match.": "Las contraseñas no coinciden.",
    "This username already exists.": "Este nombre de usuario ya existe.",
    "The username or password is incorrect.": "El nombre de usuario o la contraseña son incorrectos.",
    "Account settings saved.": "Se guardó la configuración de la cuenta.",
    "Profile saved.": "Se guardó el perfil.", "Preferences saved.": "Se guardaron las preferencias.",
    "Enter your current password to save changes.": "Ingresa tu contraseña actual para guardar los cambios.",
    "Your new password must be different from your current password.": "La nueva contraseña debe ser distinta de la actual.",
    "This local demo account has no saved password.": "Esta cuenta de demostración local no tiene una contraseña guardada.",
    "An error occurred while saving your account. Please try again.": "Ocurrió un error al guardar tu cuenta. Inténtalo de nuevo.",
    "An error occurred while saving your profile. Please try again.": "Ocurrió un error al guardar tu perfil. Inténtalo de nuevo.",
    "An error occurred while saving your preferences. Please try again.": "Ocurrió un error al guardar tus preferencias. Inténtalo de nuevo.",
    "An error occurred while signing in. Please try again.": "Ocurrió un error al iniciar sesión. Inténtalo de nuevo.",
    "Forgot your password?": "¿Olvidaste tu contraseña?", "Forgotten Password": "Recuperar contraseña",
    "If you forgot your password, enter your email address and we'll send you instructions.": "Si olvidaste tu contraseña, ingresa tu correo electrónico y te enviaremos instrucciones.",
    "Send Password": "Enviar instrucciones", "Back to sign in": "Volver a iniciar sesión",
    "This is a local demo; no email was sent.": "Esta es una demostración local; no se envió ningún correo electrónico.",
    "Manage your money. Understand your finances.": "Administra tu dinero. Comprende tus finanzas.",
    "Choose an option below to manage your accounts.": "Elige una opción para administrar tus cuentas.",
    "Account Summary": "Resumen de cuentas", "Review balances for your accounts.": "Consulta los saldos de tus cuentas.",
    "View accounts →": "Ver cuentas →", "Account Activity": "Movimientos de cuenta", "Search and filter your transactions.": "Busca y filtra tus transacciones.",
    "View activity →": "Ver movimientos →", "Transfer money between accounts.": "Transfiere dinero entre tus cuentas.",
    "Make a transfer →": "Hacer una transferencia →", "Make a simulated bill payment.": "Realiza un pago de factura de demostración.",
    "Pay bills →": "Ver opciones de pago →", "My Money Map": "Mi mapa financiero", "Explore spending by category.": "Explora tus gastos por categoría.",
    "View Money Map →": "Ver mapa financiero →", "View and download sample statements.": "Consulta y descarga estados de cuenta de ejemplo.",
    "View statements →": "Ver estados de cuenta →", "Your account balances at a glance.": "Consulta rápidamente los saldos de tus cuentas.",
    "Cash Accounts": "Cuentas de efectivo", "Investment Accounts": "Cuentas de inversión", "Credit Accounts": "Cuentas de crédito",
    "Loan Accounts": "Cuentas de préstamos", "Account": "Cuenta", "Account Type": "Tipo de cuenta", "Balance": "Saldo",
    "Checking": "Cuenta corriente", "Savings": "Ahorros", "Brokerage": "Inversiones", "Credit Card": "Tarjeta de crédito",
    "Loan": "Préstamo", "VISA ending in 1879": "VISA terminada en 1879", "VISA ending in 3943": "VISA terminada en 3943",
    "Account activity views": "Vistas de movimientos de cuenta", "Show Transactions": "Ver transacciones",
    "Find Transactions": "Buscar transacciones", "Choose an account to view.": "Elige una cuenta para ver sus movimientos.",
    "All Accounts": "Todas las cuentas", "Description": "Descripción", "Dates": "Fechas", "Amounts": "Importes",
    "Type": "Tipo", "Any": "Cualquiera", "Deposit": "Depósito", "Withdrawal": "Retiro", "Date from": "Fecha desde",
    "Date to": "Fecha hasta", "Minimum amount": "Importe mínimo", "Maximum amount": "Importe máximo", "To": "Hasta",
    "Complete at least one field below and click Find.": "Completa al menos un campo y pulsa Buscar.",
    "Find": "Filtrar", "No transactions found.": "No se encontraron transacciones.", "Date": "Fecha", "Amount": "Importe",
    "Date": "Fecha", "Description": "Descripción", "Account": "Cuenta", "Amount": "Importe", "Deposit": "Depósito", "Withdrawal": "Retiro",
    "Complete at least one field before searching.": "Completa al menos un campo antes de buscar.",
    "The start date must be before the end date.": "La fecha inicial debe ser anterior a la fecha final.",
    "The minimum amount cannot exceed the maximum amount.": "El importe mínimo no puede superar el máximo.",
    "Transfer between your accounts.": "Transfiere fondos entre tus cuentas.", "From Account": "Cuenta de origen", "To Account": "Cuenta de destino",
    "Continue": "Continuar", "Transfer Money & Make Payments - Verify": "Transferir dinero y realizar pagos - Verificar",
    "Please verify that the following transaction is correct by selecting the Submit button below.": "Verifica que los datos de la transacción sean correctos y pulsa Enviar.",
    "Cancel": "Cancelar", "Submit": "Confirmar", "Transfer Money & Make Payments - Confirm": "Transferir dinero y realizar pagos - Confirmación",
    "You successfully submitted your transaction.": "La transacción se envió correctamente.", "View transfers": "Ver transferencias",
    "or": "o", "make another transfer": "hacer otra transferencia",
    "Pay Saved Payee": "Pagar a beneficiario guardado", "Add New Payee": "Agregar beneficiario",
    "Purchase Foreign Currency": "Comprar moneda extranjera", "Bill payment options": "Opciones de pago de facturas",
    "Make payments to your saved payees": "Pagar a tus beneficiarios guardados", "Payee": "Beneficiario",
    "Payee information": "Información del beneficiario", "Select a saved payee to prepare a payment.": "Selecciona un beneficiario guardado para preparar el pago.",
    "Payment History": "Historial de pagos", "Pay": "Pagar", "Who are you paying?": "¿A quién vas a pagar?",
    "Payee Name": "Nombre del beneficiario", "Payee Address": "Dirección del beneficiario", "Payee Details": "Datos del beneficiario",
    "Add": "Agregar", "Purchase foreign currency cash": "Comprar efectivo en moneda extranjera", "Currency": "Moneda",
    "Select One": "Selecciona una opción", "Euro (EUR)": "Euro (EUR)", "British pound (GBP)": "Libra esterlina (GBP)",
    "Canadian dollar (CAD)": "Dólar canadiense (CAD)", "Japanese yen (JPY)": "Yen japonés (JPY)", "Mexican peso (MXN)": "Peso mexicano (MXN)",
    "Today's Sell Rate:": "Tipo de cambio de venta de hoy:", "U.S. dollar (USD)": "Dólar estadounidense (USD)",
    "Selected currency": "Moneda seleccionada", "Calculate Costs": "Calcular costo", "Conversion Amount": "Importe convertido",
    "Purchase": "Comprar", "Select a currency": "Selecciona una moneda", "Payee information": "Información del beneficiario",
    "My Money Map": "Mi mapa financiero", "Review the inflow and outflow of your money.": "Revisa las entradas y salidas de dinero.",
    "Inflow": "Entradas", "Outflow": "Salidas", "Payments to FireBank credit cards": "Pagos a tarjetas de crédito de FireBank",
    "Summary": "Resumen", "Category": "Categoría", "Total": "Total", "Subject: Deposits": "Asunto: depósitos",
    "Subject: Spending": "Asunto: gastos", "Direct Deposits": "Depósitos directos", "Other Deposits": "Otros depósitos",
    "Transfers from other FireBank Accounts": "Transferencias desde otras cuentas de FireBank", "Credit Card Payments": "Pagos de tarjeta de crédito",
    "Total Inflow": "Total de entradas", "Total Outflow": "Total de salidas", "What's Left": "Saldo restante",
    "OutFlow Chart": "Gráfico de salidas", "Select or clear categories in the legend to show or hide their slices.": "Selecciona o desmarca categorías en la leyenda para mostrar u ocultar sus segmentos.",
    "Select categories in the legend": "Selecciona categorías en la leyenda",
    "Transportation": "Transporte", "Auto": "Automóvil", "Charity": "Donaciones", "Checks Written": "Cheques emitidos",
    "Retail": "Comercio", "Household": "Hogar", "Insurance": "Seguros", "Office Supply": "Material de oficina",
    "Restaurants": "Restaurantes", "Telecom": "Telecomunicaciones", "Travel": "Viajes",
    "Online Statements": "Estados de cuenta en línea", "View and download sample statements.": "Consulta y descarga estados de cuenta de ejemplo.",
    "View and download sample account statements.": "Consulta y descarga tus estados de cuenta.",
    "Search statements": "Buscar estados de cuenta",
    "Search by account or period": "Buscar por cuenta o período", "Filter by year": "Filtrar por año", "All years": "Todos los años",
    "Statement": "Estado de cuenta", "Period": "Período", "Action": "Acción", "Available Statements": "Estados de cuenta disponibles",
    "Statement Details": "Detalle del estado de cuenta", "View": "Ver", "Download CSV": "Descargar CSV",
    "No statements match these filters.": "Ningún estado de cuenta coincide con estos filtros.",
    "Help Topics": "Temas de ayuda", "How do I log into my account?": "¿Cómo inicio sesión en mi cuenta?",
    "How do I transfer funds?": "¿Cómo transfiero fondos?", "How do I pay bills?": "¿Cómo pago facturas?",
    "Select Sign in from the banking home page.": "Selecciona Iniciar sesión en la página principal del banco.",
    "Enter your username and password, then select Sign in.": "Escribe tu usuario y contraseña y selecciona Iniciar sesión.",
    "This is a local demonstration; any non-empty username and password will start a demo session.": "Esta es una demostración local; cualquier usuario y contraseña que no estén vacíos iniciarán una sesión de prueba.",
    "Open Transfer Funds from the online banking navigation.": "Abre Transferir fondos desde la navegación de banca en línea.",
    "Select different accounts and enter an amount.": "Selecciona cuentas distintas e indica un importe.",
    "Select Continue and verify the transaction details.": "Selecciona Continuar y verifica los datos de la transacción.",
    "Select Submit to complete the transfer, or Cancel to return to the form.": "Selecciona Enviar para completar la transferencia o Cancelar para volver al formulario.",
    "Open Pay Bills from the online banking navigation.": "Abre Pagar facturas desde la navegación de banca en línea.",
    "Select a saved payee from the first dropdown menu.": "Selecciona un beneficiario guardado en el primer menú desplegable.",
    "Select the account from which you want to pull funds.": "Selecciona la cuenta de la que se retirarán los fondos.",
    "Enter the amount and date, then click the Pay button.": "Indica el importe y la fecha, y pulsa Pagar.",
    "Add a new payee from the Add New Payee tab.": "Agrega un beneficiario desde la pestaña Agregar beneficiario.",
    "Send feedback about this demonstration.": "Envía comentarios sobre esta demostración.", "Name": "Nombre", "Email": "Correo electrónico",
    "Subject": "Asunto", "Comment": "Comentario", "Send": "Enviar", "Clear": "Borrar",
    "Feedback recorded in this demo interface; it was not sent to a server.": "El comentario se registró en esta demostración; no se envió a ningún servidor.",
    "FireBank Demo · Personal Banking · Loans · Credit Cards": "Demostración de FireBank · Banca personal · Préstamos · Tarjetas de crédito",
    "Enter your username and password.": "Introduce tu usuario y contraseña.", "Demo session started.": "Sesión de demostración iniciada.",
    "Choose different accounts.": "Selecciona cuentas distintas.", "Enter a valid amount.": "Introduce un importe válido.",
    "Insufficient demo account balance.": "Saldo insuficiente en la cuenta de demostración.",
    "Insufficient demo checking balance.": "Saldo insuficiente en la cuenta corriente de demostración.",
    "A payee with this name already exists.": "Ya existe un beneficiario con ese nombre.",
    "Select a currency.": "Selecciona una moneda.", "Calculate the conversion before purchasing.": "Calcula la conversión antes de comprar.",
    "Today's Sell Rate: Select a currency": "Tipo de cambio de venta de hoy: selecciona una moneda",
    "Conversion Amount: ": "Importe convertido: ", "No matching sections found.": "No se encontraron secciones.",
    "Open section": "Abrir sección", "Period:": "Período:", "Bill Payment: ": "Pago de factura: ",
    "Payment of {amount} to {payee} was successful.": "El pago de {amount} a {payee} se realizó correctamente.",
    "{name} was added to your saved payees.": "Se agregó {name} a tus beneficiarios guardados.",
    "Foreign currency cash was successfully purchased: {foreign} {currency} for {amount} from Checking.": "La compra de efectivo en moneda extranjera se realizó correctamente: {foreign} {currency} por {amount} desde Cuenta corriente.",
    "Demo transfer completed: {amount}.": "Transferencia de demostración completada: {amount}.",
    "View and download sample statements.": "Consulta y descarga estados de cuenta de ejemplo.",
    "Checking Statement": "Estado de cuenta corriente", "Savings Statement": "Estado de cuenta de ahorros",
    "October 2026": "Octubre de 2026", "September 2026": "Septiembre de 2026",
    "1. How do I log into my account?": "1. ¿Cómo inicio sesión en mi cuenta?",
    "2. How do I transfer funds?": "2. ¿Cómo transfiero fondos?", "3. How do I pay bills?": "3. ¿Cómo pago facturas?",
    "Savings Deposit": "Depósito de ahorros", "Monthly Salary": "Salario mensual",
    "Grocery Store": "Tienda de comestibles", "Coffee Shop": "Cafetería","Gas company": "Compañía de gas",
    "Electric Company": "Compañía eléctrica", "Internet Provider": "Proveedor de internet",
    "Supermarket": "Supermercado", "Restaurant": "Restaurante", "Fuel Station": "Estación de servicio",
    "Water Services": "Servicios de agua", "Telephone Company": "Compañía telefónica",
    "Subject: Deposits": "Asunto: depósitos", "Subject: Spending": "Asunto: gastos", "Data sharing": "Compartir datos", "Account security": "Seguridad de la cuenta", 
    "Privacy settings play a fundamental role in protecting personal information in today's digital world. Every time users create an account on a social network, shopping platform, streaming service, or mobile application, they share data that can reveal details about their habits, preferences, interests, and even their location. Privacy settings allow individuals to control who can access this information and how it may be used. Without proper privacy controls, personal data can become visible to strangers, advertisers, or unauthorized third parties. For this reason, understanding and configuring privacy settings correctly is one of the most important aspects of maintaining online safety. One of the primary functions of privacy settings is controlling the visibility of personal information. Many online platforms provide users with options to determine who can see their profile details, posts, photos, contact information, and activity history. Some users may prefer to make their content public to reach a larger audience, while others choose to restrict access to friends, family members, or specific groups. These settings provide flexibility and help users balance convenience with security. Regularly reviewing privacy preferences is important because platforms frequently update their policies and available controls. Privacy settings also influence how personal information is collected and processed by organizations. Many websites and applications gather data to improve services, personalize content, and deliver targeted advertising. Through privacy controls, users can often limit data collection, manage tracking preferences, disable location sharing, or opt out of certain marketing activities. Taking advantage of these options can significantly reduce the amount of personal information shared online. Users should also read privacy policies carefully to understand what information is collected and how it is stored, shared, or sold to third parties. Another critical aspect of privacy management is protecting sensitive information from cybercriminals. Publicly visible details such as birth dates, addresses, phone numbers, or workplace information can be exploited in identity theft attempts or phishing scams. By adjusting privacy settings appropriately, users can reduce their exposure to these risks. Additionally, limiting the amount of personal information available online makes it more difficult for malicious actors to build detailed profiles that can be used against them. Ultimately, privacy settings are an essential tool for maintaining control over personal data and preserving digital security. Technology continues to evolve rapidly, and new forms of data collection emerge regularly. As a result, users should make privacy management a routine practice by reviewing account settings, understanding platform policies, and making informed decisions about the information they share. A proactive approach to privacy not only protects personal information but also contributes to a safer and more trustworthy online experience.": "La configuración de privacidad desempeña un papel fundamental en la protección de la información personal en el mundo digital actual. Cada vez que los usuarios crean una cuenta en una red social, una plataforma de compras, un servicio de streaming o una aplicación móvil, comparten datos que pueden revelar detalles sobre sus hábitos, preferencias, intereses e incluso su ubicación. Las opciones de privacidad permiten a las personas controlar quién puede acceder a esta información y cómo puede utilizarse. Sin unos controles adecuados, los datos personales pueden quedar expuestos a desconocidos, anunciantes o terceros no autorizados. Por ello, comprender y configurar correctamente la privacidad es uno de los aspectos más importantes para mantener la seguridad en línea. Una de las funciones principales de la configuración de privacidad es controlar la visibilidad de la información personal. Muchas plataformas ofrecen opciones para decidir quién puede ver los datos del perfil, las publicaciones, las fotografías, la información de contacto y el historial de actividad. Algunos usuarios prefieren que su contenido sea público para llegar a una audiencia más amplia, mientras que otros optan por restringir el acceso a amigos, familiares o grupos específicos. Estas configuraciones proporcionan flexibilidad y ayudan a equilibrar la comodidad con la seguridad. Revisar periódicamente estas preferencias es importante porque las plataformas actualizan con frecuencia sus políticas y controles disponibles. La configuración de privacidad también influye en la forma en que las organizaciones recopilan y procesan información personal. Muchos sitios web y aplicaciones recopilan datos para mejorar sus servicios, personalizar contenidos y ofrecer publicidad dirigida. Mediante los controles de privacidad, los usuarios pueden limitar la recopilación de datos, gestionar las preferencias de seguimiento, desactivar la compartición de ubicación o rechazar ciertas actividades de marketing. Aprovechar estas opciones puede reducir significativamente la cantidad de información personal compartida en Internet. Además, es recomendable leer las políticas de privacidad para comprender qué datos se recopilan y cómo se almacenan, comparten o venden a terceros. Otro aspecto crítico de la gestión de la privacidad es la protección de la información sensible frente a los ciberdelincuentes. Datos visibles públicamente como fechas de nacimiento, direcciones, números de teléfono o información laboral pueden ser utilizados en robos de identidad o ataques de phishing. Ajustando adecuadamente la configuración de privacidad, los usuarios pueden reducir de forma considerable su exposición a estos riesgos. Asimismo, limitar la información disponible en línea dificulta que los actores maliciosos elaboren perfiles detallados que puedan utilizar en su contra. En definitiva, la configuración de privacidad es una herramienta esencial para mantener el control sobre los datos personales y preservar la seguridad digital. La tecnología evoluciona constantemente y surgen nuevas formas de recopilación de información. Por ello, los usuarios deben convertir la gestión de la privacidad en una práctica habitual, revisando sus cuentas y tomando decisiones informadas sobre la información que comparten.",
    "Data sharing refers to the practice of exchanging, transferring, or providing access to information between individuals, organizations, systems, or applications. In today's digital economy, data sharing has become a critical component of business operations, technological innovation, and user experiences. Organizations use shared data to improve decision-making, enhance products and services, conduct research, and create personalized experiences for customers. While data sharing offers significant benefits, it also presents challenges related to privacy, security, compliance, and trust. One of the main advantages of data sharing is improved collaboration. Businesses often exchange information with partners, suppliers, service providers, and customers to streamline operations and improve efficiency. For example, a logistics company may share shipment data with retailers to provide real-time delivery updates, while healthcare institutions can exchange patient information to improve treatment outcomes. When managed properly, data sharing enables organizations to make informed decisions and respond more effectively to changing circumstances. Data sharing also plays a major role in innovation and technological development. Researchers, developers, and analysts rely on access to data to identify trends, build predictive models, and develop new solutions. Open data initiatives launched by governments and public institutions have contributed to advances in fields such as transportation, healthcare, environmental protection, and education. By making information accessible, organizations can encourage collaboration and accelerate progress across multiple sectors. However, the sharing of information must be balanced with appropriate safeguards. Personal and sensitive data require strong protection to prevent unauthorized access, misuse, or disclosure. Organizations must comply with relevant regulations and ensure that data is collected, processed, and shared responsibly. Transparency is essential, and users should be clearly informed about what information is being shared, who will receive it, and for what purpose. Consent mechanisms and data protection measures help build trust and reduce potential risks. Another important consideration involves cybersecurity threats. Data exchanges often create additional points of vulnerability that malicious actors may attempt to exploit. Secure communication channels, encryption technologies, access controls, and regular monitoring are necessary to protect shared information. Organizations that fail to implement adequate safeguards may face data breaches, financial losses, legal consequences, and reputational damage. In conclusion, data sharing provides substantial benefits for businesses, governments, and individuals by enabling collaboration, innovation, and efficiency. Nevertheless, these advantages can only be fully realized when data is handled responsibly and securely. Strong governance policies, regulatory compliance, transparency, and cybersecurity practices are essential to ensure that shared information remains protected while delivering value to all stakeholders involved.": "El intercambio de datos consiste en compartir, transferir o proporcionar acceso a información entre personas, organizaciones, sistemas o aplicaciones. En la economía digital actual, esta práctica se ha convertido en un elemento clave para las operaciones empresariales, la innovación tecnológica y la mejora de la experiencia de los usuarios. Las organizaciones utilizan los datos compartidos para optimizar la toma de decisiones, mejorar productos y servicios, realizar investigaciones y ofrecer experiencias personalizadas a sus clientes. Aunque el intercambio de datos aporta numerosos beneficios, también plantea desafíos relacionados con la privacidad, la seguridad, el cumplimiento normativo y la confianza. Una de las principales ventajas del intercambio de datos es la mejora de la colaboración. Las empresas comparten información con socios, proveedores, clientes y prestadores de servicios para optimizar procesos y aumentar la eficiencia. Por ejemplo, una empresa de logística puede intercambiar datos de envíos con comercios para ofrecer actualizaciones en tiempo real, mientras que las instituciones sanitarias pueden compartir información de pacientes para mejorar los resultados de los tratamientos. Cuando este proceso se gestiona correctamente, permite tomar decisiones mejor fundamentadas y responder con mayor rapidez a los cambios. El intercambio de datos también desempeña un papel fundamental en la innovación y el desarrollo tecnológico. Investigadores, desarrolladores y analistas utilizan los datos para identificar tendencias, crear modelos predictivos y desarrollar nuevas soluciones. Las iniciativas de datos abiertos impulsadas por gobiernos e instituciones públicas han contribuido al progreso en ámbitos como el transporte, la sanidad, la protección medioambiental y la educación. Al facilitar el acceso a la información, las organizaciones fomentan la colaboración y aceleran el avance en múltiples sectores. Sin embargo, compartir información exige la implementación de medidas de protección adecuadas. Los datos personales y sensibles requieren mecanismos sólidos para evitar accesos no autorizados, usos indebidos o divulgaciones accidentales. Las organizaciones deben cumplir con las normativas aplicables y garantizar que los datos se recopilan, procesan y comparten de manera responsable. La transparencia es fundamental, por lo que los usuarios deben conocer qué información será compartida, con quién y con qué finalidad. Los mecanismos de consentimiento y las medidas de protección ayudan a generar confianza y a reducir riesgos. Otro aspecto importante son las amenazas relacionadas con la ciberseguridad. Cada intercambio de información puede generar nuevos puntos vulnerables que los atacantes intenten explotar. Por ello, resulta imprescindible utilizar canales seguros, cifrado, controles de acceso y supervisión constante. Las organizaciones que descuidan estas medidas pueden enfrentarse a brechas de seguridad, pérdidas económicas, sanciones legales y daños reputacionales. En conclusión, el intercambio de datos aporta importantes beneficios al facilitar la colaboración, la innovación y la eficiencia. No obstante, estos beneficios solo pueden aprovecharse plenamente cuando la información se gestiona de forma responsable, transparente y segura.",
    "Account security is one of the most important aspects of protecting personal and professional information in the digital age. Online accounts often contain sensitive data, including financial information, personal communications, documents, photographs, and access to various digital services. Because cybercriminals continuously seek opportunities to gain unauthorized access to accounts, individuals and organizations must take proactive measures to strengthen security and reduce vulnerabilities. The foundation of account security begins with strong passwords. A secure password should be unique, sufficiently long, and composed of a combination of letters, numbers, and special characters. Reusing the same password across multiple services can increase risk because a compromise in one account may lead to unauthorized access to others. Password managers can help users create and store complex passwords securely, reducing the temptation to use weak or repetitive credentials. Another essential security measure is multi-factor authentication (MFA). This method requires users to provide additional verification beyond a password, such as a code sent to a mobile device, a biometric scan, or an authentication application. MFA significantly reduces the likelihood of unauthorized access because attackers would need more than just a stolen password to compromise an account. Many online platforms now offer MFA and strongly encourage users to enable it as an additional layer of protection. Users should also be aware of phishing attacks and social engineering techniques. Cybercriminals often attempt to deceive individuals through fraudulent emails, messages, or websites designed to steal login credentials. Learning how to recognize suspicious communications is critical for maintaining account security. Signs such as unexpected requests for personal information, urgent warnings, spelling mistakes, or unfamiliar links should be treated with caution. Verifying the authenticity of requests before providing information can prevent many security incidents. Regular monitoring and maintenance are equally important. Users should review account activity, update passwords periodically when necessary, and keep software and devices updated with the latest security patches. Many platforms provide notifications about unusual login attempts or security changes, allowing account owners to respond quickly to potential threats. Removing unused accounts and limiting access permissions can further reduce exposure to security risks. In summary, account security requires a combination of strong passwords, multi-factor authentication, user awareness, and ongoing vigilance. Cyber threats continue to evolve, making security a shared responsibility between service providers and users. By adopting good security practices and staying informed about emerging risks, individuals can better protect their information, maintain control of their digital identities, and reduce the likelihood of becoming victims of cybercrime.": "La seguridad de las cuentas es uno de los aspectos más importantes para proteger la información personal y profesional en la era digital. Las cuentas en línea suelen contener datos sensibles, como información financiera, comunicaciones privadas, documentos, fotografías y acceso a diversos servicios digitales. Debido a que los ciberdelincuentes buscan constantemente oportunidades para acceder de forma no autorizada a estas cuentas, tanto los usuarios como las organizaciones deben adoptar medidas proactivas para reforzar la seguridad y reducir vulnerabilidades. La base de la seguridad de una cuenta comienza con el uso de contraseñas seguras. Una contraseña robusta debe ser única, lo suficientemente larga y combinar letras, números y caracteres especiales. Reutilizar la misma contraseña en varios servicios aumenta significativamente el riesgo, ya que una filtración en una plataforma podría comprometer otras cuentas. Los gestores de contraseñas ayudan a generar y almacenar credenciales complejas de forma segura, evitando el uso de contraseñas débiles o repetidas. Otra medida esencial es la autenticación multifactor o MFA. Este sistema requiere una verificación adicional además de la contraseña, como un código enviado al teléfono móvil, una huella dactilar o una aplicación de autenticación. La MFA reduce considerablemente la probabilidad de accesos no autorizados porque un atacante necesitaría más que una simple contraseña para entrar en una cuenta. Por esta razón, cada vez más plataformas ofrecen esta función y recomiendan activarla. Los usuarios también deben estar atentos a los ataques de phishing y a las técnicas de ingeniería social. Los ciberdelincuentes suelen intentar engañar a las personas mediante correos electrónicos, mensajes o sitios web falsos diseñados para obtener credenciales de acceso. Aprender a identificar este tipo de amenazas es fundamental. Solicitudes inesperadas de información personal, mensajes alarmistas, errores ortográficos o enlaces desconocidos son señales que deben analizarse con precaución. Verificar siempre la autenticidad de las comunicaciones puede evitar numerosos incidentes de seguridad. La supervisión y el mantenimiento periódico también son elementos clave. Es aconsejable revisar la actividad de las cuentas, actualizar contraseñas cuando sea necesario y mantener los dispositivos y aplicaciones actualizados con los últimos parches de seguridad. Muchas plataformas ofrecen alertas sobre intentos de acceso sospechosos o cambios relevantes en la configuración, lo que permite actuar rápidamente ante posibles amenazas. Además, eliminar cuentas que ya no se utilizan y limitar los permisos de acceso ayuda a reducir riesgos. En resumen, la seguridad de las cuentas depende de una combinación de contraseñas fuertes, autenticación multifactor, concienciación de los usuarios y vigilancia constante. Adoptar buenas prácticas de seguridad permite proteger mejor la información, mantener el control de la identidad digital y disminuir considerablemente las posibilidades de sufrir un ataque cibernético.",
};
const spanishToEnglish = new Map(Object.entries(spanishText).map(([english, spanish]) => [spanish, english]));

function translateText(text, values = {}) {
    const billPrefix = "Bill Payment: ";
    const translatedBillPrefix = spanishText[billPrefix];
    if (currentLanguage === "es" && text.startsWith(billPrefix)) {
        text = translatedBillPrefix + text.slice(billPrefix.length);
    } else if (currentLanguage === "en" && text.startsWith(translatedBillPrefix)) {
        text = billPrefix + text.slice(translatedBillPrefix.length);
    }
    const english = spanishToEnglish.get(text) || text;
    let translated = currentLanguage === "es" ? (spanishText[english] || text) : english;
    for (const [key, value] of Object.entries(values)) translated = translated.replaceAll(`{${key}}`, value);
    return translated;
}

const privacyParagraphStarts = {
    setting: {
        en: ["One of the primary functions", "Privacy settings also influence", "Another critical aspect", "Ultimately, privacy settings"],
        es: ["Una de las funciones principales", "La configuración de privacidad también influye", "Otro aspecto crítico", "En definitiva, la configuración"]
    },
    sharing: {
        en: ["One of the main advantages", "Data sharing also plays", "However, the sharing", "Another important consideration", "In conclusion, data sharing"],
        es: ["Una de las principales ventajas", "El intercambio de datos también desempeña", "Sin embargo, compartir información", "Otro aspecto importante", "En conclusión, el intercambio"]
    },
    security: {
        en: ["The foundation of account security", "Another essential security measure", "Users should also be aware", "Regular monitoring and maintenance", "In summary, account security"],
        es: ["La base de la seguridad", "Otra medida esencial", "Los usuarios también deben estar atentos", "La supervisión y el mantenimiento", "En resumen, la seguridad"]
    }
};

function renderPrivacyParagraph(element) {
    if (!element.dataset.privacyEnglish) {
        const paragraphs = element.textContent.trim().split(/\n\s*\n/).map(paragraph => paragraph.replace(/\s+/g, " ").trim()).filter(Boolean);
        element.dataset.privacyEnglish = paragraphs.join(" ");
    }

    const text = translateText(element.dataset.privacyEnglish);
    const topic = element.closest("[data-privacy-content]")?.dataset.privacyContent;
    const starts = privacyParagraphStarts[topic]?.[currentLanguage] || [];
    const boundaries = starts.map(start => text.indexOf(start)).filter(index => index >= 0).sort((a, b) => a - b);
    if (boundaries.length !== starts.length) {
        console.error(`Unable to restore all paragraph breaks for privacy topic "${topic}" in ${currentLanguage}.`);
        element.textContent = text;
        return;
    }

    const paragraphs = [];
    let offset = 0;
    boundaries.forEach(boundary => {
        paragraphs.push(text.slice(offset, boundary).trim());
        offset = boundary;
    });
    paragraphs.push(text.slice(offset).trim());
    element.innerHTML = paragraphs.map(esc).join("<br><br>");
}

function translatePage(root = document.body) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node => {
        const parent = node.parentElement;
        if (!parent || parent.closest("[data-no-translate], script, style, .privacy-paraph")) return;
        const original = node.nodeValue;
        const content = original.trim().replace(/\s+/g, " ");
        if (!content) return;
        const translated = translateText(content);
        if (translated !== content) node.nodeValue = original.replace(original.trim(), translated);
    });

    root.querySelectorAll(".privacy-paraph").forEach(renderPrivacyParagraph);
    root.querySelectorAll("[placeholder], [aria-label], [title], [aria-description]").forEach(element => {
        ["placeholder", "aria-label", "title", "aria-description"].forEach(attribute => {
            if (element.hasAttribute(attribute)) {
                element.setAttribute(attribute, translateText(element.getAttribute(attribute)));
            }
        });
    });
    root.querySelectorAll("[data-translation-key]").forEach(element => {
        let values = {};
        try { values = JSON.parse(element.dataset.translationValues || "{}"); } catch { values = {}; }
        element.textContent = translateText(element.dataset.translationKey, values);
    });
    document.documentElement.lang = currentLanguage;
    document.title = translateText("Fire- Personal Banking");
    $("language-current").textContent = currentLanguage === "es" ? "Español" : "English";
    $("language-trigger").setAttribute("aria-label", currentLanguage === "es" ? "Seleccionar idioma" : "Select language");
    document.querySelectorAll("[data-language]").forEach(option => {
        option.setAttribute("aria-checked", String(option.dataset.language === currentLanguage));
    });
}

function setLanguage(language) {
    currentLanguage = language === "es" ? "es" : "en";
    localStorage.setItem("zero-language", currentLanguage);
    translatePage();
    closeHeaderMenus();
}

const money = n => Number(n).toLocaleString(currentLanguage === "es" ? "es-US" : "en-US", { style: "currency", currency: "USD" });
const today = () => new Date().toISOString().slice(0, 10);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const categories = [
    { name: "Transportation", value: 160, color: "#7b9900" },
    { name: "Auto", value: 102.38, color: "#125c99" },
    { name: "Charity", value: 100, color: "#971225" },
    { name: "Checks Written", value: 255, color: "#ef8000" },
    { name: "Retail", value: 375.55, color: "#ffca28" },
    { name: "Household", value: 100, color: "#981080" },
    { name: "Insurance", value: 600, color: "#239f91" },
    { name: "Office Supply", value: 37.18, color: "#777777" },
    { name: "Restaurants", value: 295.89, color: "#95510d" },
    { name: "Telecom", value: 95, color: "#c587ce" }
];

const currencyRates = { EUR: 0.92, GBP: 0.79, CAD: 1.36, JPY: 149.50, MXN: 17.10 };

const statementArchive = [
    { id: "checking-oct", name: "Checking Statement", account: "Checking", period: "October 2026", month: "2026-10" },
    { id: "savings-oct", name: "Savings Statement", account: "Savings", period: "October 2026", month: "2026-10" },
    { id: "checking-sep", name: "Checking Statement", account: "Checking", period: "September 2026", month: "2026-09" },
    { id: "savings-sep", name: "Savings Statement", account: "Savings", period: "September 2026", month: "2026-09" }
];

const state = {
    checking: 245000,
    savings: 127500.50,
    loggedIn: Boolean(rememberedUser),
    username: rememberedUser || "",
    profile: userRecords[userKey(rememberedUser || "")]?.profile || emptyProfile(rememberedUser),
    pendingTransfer: null,
    activityMode: "show",
    activitySearchApplied: false,
    transactions: [
        { date: "2026-10-01", name: "Monthly Salary", account: "Checking", amount: 2200, category: "Direct Deposits" },
        { date: "2026-10-02", name: "Grocery Store", account: "Checking", amount: -84.50, category: "Retail" },
        { date: "2026-10-03", name: "Coffee Shop", account: "Checking", amount: -12.50, category: "Restaurants" },
        { date: "2026-10-04", name: "Electric Company", account: "Checking", amount: -75, category: "Household" },
        { date: "2026-10-05", name: "Internet Provider", account: "Checking", amount: -49.99, category: "Telecom" },
        { date: "2026-10-06", name: "Savings Deposit", account: "Savings", amount: 300, category: "Other Deposits" },
        { date: "2026-10-07", name: "Supermarket", account: "Checking", amount: -62.30, category: "Retail" },
        { date: "2026-10-08", name: "Restaurant", account: "Checking", amount: -45, category: "Restaurants" },
        { date: "2026-10-09", name: "Fuel Station", account: "Checking", amount: -55, category: "Transportation" }
    ],
    bills: [],
    payees: [
        { name: "Gas company", address: "", account: "", details: "" },
        { name: "Electric Company", address: "", account: "", details: "" },
        { name: "Internet Provider", address: "", account: "", details: "" },
        { name: "Water Services", address: "", account: "", details: "" },
        { name: "Credit Card", address: "", account: "", details: "" },
        { name: "Telephone Company", address: "", account: "", details: "" }
    ],
    currencyCalculation: null,
    statementYear: "all",
    visibleCategories: new Set(categories.map(c => c.name))
};

const protectedPages = [
    "account-summary", "account-activity", "checking-account-activity",
    "transfer-funds", "pay-bills", "money-map", "online-statements",
    "privacy", "account-settings", "my-profile"
];
const accountTabPages = [
    "account-summary", "account-activity", "checking-account-activity",
    "transfer-funds", "pay-bills", "money-map", "online-statements"
];

function message(id, text, type = "success") {
    const element = $(id);
    element.className = "notice " + type;
    element.dataset.translationKey = text;
    element.dataset.translationValues = "{}";
    element.textContent = translateText(text);
}

function accountName(a) { return a === "checking" ? "Checking" : "Savings" }

function transactionTable(items) {
    if (!items.length) return `<p>${translateText("No transactions found.")}</p>`;
    return `<div><table><thead><tr><th>${translateText("Date")}</th><th>${translateText("Description")}</th><th>${translateText("Account")}</th><th>${translateText("Amount")}</th></tr></thead><tbody>${items.map(t => `<tr><td>${esc(t.date)}</td><td>${esc(translateText(t.name))}</td><td>${translateText(esc(t.account))}</td><td class="${t.amount >= 0 ? "positive" : "negative"}">${t.amount > 0 ? "+" : ""}${money(t.amount)}</td></tr>`).join("")
        }</tbody></table></div>`;
}

function activityTable(items) {
    if (!items.length) return `<p class="muted">${translateText("No transactions found.")}</p>`;
    const amountText = amount => Math.abs(amount).toFixed(2).replace(/\.?0+$/, "");
    return `<div><table class="activity-results-table"><thead><tr><th>${translateText("Date")}</th><th>${translateText("Description")}</th><th>${translateText("Deposit")}</th><th>${translateText("Withdrawal")}</th></tr></thead><tbody>${items.map(t => `<tr><td>${esc(t.date)}</td><td>${esc(translateText(t.name))}</td><td>${t.amount > 0 ? amountText(t.amount) : ""}</td><td>${t.amount < 0 ? amountText(t.amount) : ""}</td></tr>`).join("")}</tbody></table></div>`;
}

function renderBalances() {
    $("checking-table").textContent = money(state.checking);
    $("savings-table").textContent = money(state.savings);
    renderActivity();
    renderBills();
    renderMoneyMap();
}

function setActivityMode(mode) {
    state.activityMode = mode;
    state.activitySearchApplied = false;
    const showTransactions = mode === "show";
    $("show-transactions-tab").classList.toggle("active", showTransactions);
    $("show-transactions-tab").setAttribute("aria-selected", String(showTransactions));
    $("find-transactions-tab").classList.toggle("active", !showTransactions);
    $("find-transactions-tab").setAttribute("aria-selected", String(!showTransactions));
    $("activity-heading").textContent = showTransactions ? "Show Transactions" : "Find Transactions";
    $("activity-subtitle").textContent = showTransactions
        ? "Choose an account to view."
        : "Complete at least one field below and click Find.";
    $("activity-find-message").classList.add("hidden");
    $("activity-account-control").classList.toggle("hidden", !showTransactions);
    $("activity-search-panel").classList.toggle("hidden", showTransactions);
    translatePage($("page-account-activity"));
    renderActivity();
}

function renderActivity() {
    const results = $("activity-results");
    if (!results) return;
    if (state.activityMode === "find" && !state.activitySearchApplied) {
        results.classList.add("hidden");
        return;
    }

    results.classList.remove("hidden");
    const account = $("activity-account").value;
    const search = $("activity-description").value.trim().toLowerCase();
    const dateFrom = $("activity-date-from").value;
    const dateTo = $("activity-date-to").value;
    const minAmount = $("activity-amount-min").value === "" ? null : Number($("activity-amount-min").value);
    const maxAmount = $("activity-amount-max").value === "" ? null : Number($("activity-amount-max").value);
    const type = $("activity-type").value;
    const searchActive = state.activityMode === "find" && state.activitySearchApplied;
    const items = state.transactions.filter(t =>
        (account === "all" || t.account === account) &&
        (!searchActive || (t.name + " " + t.category + " " + t.date).toLowerCase().includes(search)) &&
        (!searchActive || !dateFrom || t.date >= dateFrom) &&
        (!searchActive || !dateTo || t.date <= dateTo) &&
        (!searchActive || minAmount === null || Math.abs(t.amount) >= minAmount) &&
        (!searchActive || maxAmount === null || Math.abs(t.amount) <= maxAmount) &&
        (!searchActive || type === "all" || (type === "debit" && t.amount < 0) || (type === "credit" && t.amount > 0))
    );
    results.innerHTML = activityTable(items);
    translatePage(results);
}

function findTransactions(event) {
    event.preventDefault();
    const description = $("activity-description").value.trim();
    const dateFrom = $("activity-date-from").value;
    const dateTo = $("activity-date-to").value;
    const minAmount = $("activity-amount-min").value;
    const maxAmount = $("activity-amount-max").value;
    const hasCriteria = description || dateFrom || dateTo || minAmount || maxAmount || $("activity-type").value !== "all";
    const error = $("activity-find-message");

    let errorText = "";
    if (!hasCriteria) errorText = "Complete at least one field before searching.";
    else if (dateFrom && dateTo && dateFrom > dateTo) errorText = "The start date must be before the end date.";
    else if (minAmount !== "" && maxAmount !== "" && Number(minAmount) > Number(maxAmount)) {
        errorText = "The minimum amount cannot exceed the maximum amount.";
    }

    if (errorText) {
        error.textContent = errorText;
        error.classList.remove("hidden");
        state.activitySearchApplied = false;
        renderActivity();
        return;
    }

    error.classList.add("hidden");
    state.activitySearchApplied = true;
    renderActivity();
}

function renderBills() {
    $("bill-history").innerHTML = transactionTable(state.bills);
    translatePage($("bill-history"));
}

function renderMoneyMap() {
    const inflow = state.transactions.filter(t => t.amount > 0);
    const outflow = state.transactions.filter(t => t.amount < 0);
    const deposits = inflow.reduce((s, t) => s + t.amount, 0);
    const spent = categories.reduce((s, c) => s + c.value, 0);
    const actualSpend = outflow.reduce((s, t) => s - t.amount, 0);
    const moneyRows = (rows) => rows.map(([name, value]) =>
        `<tr><td>${esc(name)}</td><td>${money(value)}</td><td><span class="info" title="${esc(name)}">●</span></td></tr>`
    ).join("");

    $("inflow-table").innerHTML = `<table>
    <thead><tr><th>Category</th><th>Amount</th><th></th></tr></thead>
    <tbody><tr class="subject"><td colspan="3">⊟ ${translateText("Subject: Deposits")}</td></tr>
    ${moneyRows([["Direct Deposits", 0], ["Other Deposits", 5000], ["Transfers from other FireBank Accounts", 1150]])}
    <tr><th>Total</th><th colspan="2">${money(6150)}</th></tr></tbody></table>`;

    $("outflow-table").innerHTML = `<table>
    <thead><tr><th>Category</th><th>Amount</th><th></th></tr></thead>
    <tbody><tr class="subject"><td colspan="3">⊟ ${translateText("Subject: Spending")}</td></tr>
    ${moneyRows(categories.map(c => [c.name, c.value]))}
    <tr><th>Total</th><th colspan="2">${money(spent)}</th></tr></tbody></table>`;

    $("credit-payment-table").innerHTML = `<table><thead><tr><th>Category</th><th>Amount</th></tr></thead><tbody><tr><td>Credit Card Payments</td><td>${money(0)}</td></tr></tbody></table>`;

    $("money-summary").innerHTML = `<table><thead><tr><th>Category</th><th>Amount</th></tr></thead><tbody>
    <tr><td>Total Inflow</td><td>${money(6150)}</td></tr>
    <tr><td>Total Outflow</td><td>${money(spent)}</td></tr>
    <tr><th>What's Left</th><th>${money(6150 - spent)}</th></tr>
    </tbody></table>`;

    renderPie();
    translatePage($("page-money-map"));
}

function polar(cx, cy, r, angle) {
    const a = (angle - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function slicePath(cx, cy, r, start, end) {
    const p1 = polar(cx, cy, r, start), p2 = polar(cx, cy, r, end);
    const large = end - start > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y} Z`;
}

function renderPie() {
    const svg = $("pie-chart");
    const legend = $("chart-legend");
    const visible = categories.filter(c => state.visibleCategories.has(c.name));
    const total = visible.reduce((s, c) => s + c.value, 0);

    legend.innerHTML = categories.map((c, i) => `
    <label>
      <input type="checkbox" data-category="${esc(c.name)}" ${state.visibleCategories.has(c.name) ? "checked" : ""}>
      <span class="legend-color" style="background:${c.color}"></span>
      <span>${esc(c.name)}</span>
    </label>`).join("");

    legend.querySelectorAll("input").forEach(input => {
        input.addEventListener("change", () => {
            const name = input.dataset.category;
            if (input.checked) state.visibleCategories.add(name);
            else state.visibleCategories.delete(name);
            renderPie();
        });
    });

    if (!visible.length || total === 0) {
        svg.innerHTML = '<text x="270" y="235" text-anchor="middle" fill="#1D1616" font-size="16">Select categories in the legend</text>';
        translatePage($("page-money-map"));
        return;
    }

    const cx = 220, cy = 225, r = 190;
    let angle = 0;
    const slices = visible.map(c => {
        const start = angle;
        const end = angle + c.value / total * 360;
        angle = end;
        const mid = (start + end) / 2;
        const category = translateText(c.name);
        const labelRadius = r * .68;
        const label = polar(cx, cy, labelRadius, mid);
        const labelWidth = category.length * 6.5;
        const availableArc = labelRadius * (end - start) * Math.PI / 180;
        const showLabel = availableArc >= labelWidth + 12;
        return `<path d="${slicePath(cx, cy, r, start, end)}" fill="${c.color}" stroke="#EEEEEE" stroke-width="1"><title>${esc(category)}: ${money(c.value)}</title></path>
      ${showLabel ? `<text x="${label.x}" y="${label.y}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${mid > 90 && mid < 270 ? mid + 180 : mid} ${label.x} ${label.y})" font-size="12" fill="${c.color === "#D84040" ? "#1D1616" : "#EEEEEE"}" pointer-events="none">${esc(category)}</text>` : ""}`;
    }).join("");

    svg.innerHTML = `<defs><filter id="shadow"><feDropShadow dx="1" dy="2" stdDeviation="1.5" flood-color="#1D1616" flood-opacity=".22"/></filter></defs><g filter="url(#shadow)">${slices}</g>`;
    translatePage($("page-money-map"));
}

function renderStatements() {
    const query = $("statement-search").value.trim().toLowerCase();
    const years = [...new Set(statementArchive.map(s => s.period.slice(-4)))].sort((a, b) => b.localeCompare(a));
    $("statement-years").innerHTML = ["all", ...years].map(year => {
        const label = year === "all" ? "All years" : year;
        return `<button type="button" data-statement-year="${year}" class="${state.statementYear === year ? "active" : ""}" aria-pressed="${state.statementYear === year}">${label}</button>`;
    }).join("");

    const matches = statementArchive.filter(statement =>
        (state.statementYear === "all" || statement.period.endsWith(state.statementYear)) &&
        [statement.name, statement.account, statement.period, translateText(statement.name),
        translateText(statement.account), translateText(statement.period)].join(" ").toLowerCase().includes(query)
    );
    $("statement-list").innerHTML = matches.length ? matches.map(s => `<tr>
    <td>${s.name}</td><td>${s.account}</td><td>${s.period}</td>
    <td><button class="btn" onclick="viewStatement('${s.id}')">View</button>
    <button class="btn gray" onclick="downloadStatement('${s.id}')">Download CSV</button></td></tr>`).join("")
        : '<tr><td colspan="4" class="muted">No statements match these filters.</td></tr>';
    translatePage($("page-online-statements"));
}

function getStatement(id) {
    const statement = statementArchive.find(s => s.id === id);
    if (!statement) return { account: "", month: "", items: [] };
    return {
        account: statement.account,
        month: statement.month,
        items: state.transactions.filter(t => t.account === statement.account && t.date.startsWith(statement.month))
    };
}
function viewStatement(id) {
    const s = getStatement(id);
    $("statement-preview").classList.remove("hidden");
    const month = new Date(`${s.month}-01T00:00:00`).toLocaleDateString(currentLanguage === "es" ? "es-US" : "en-US", { month: "long", year: "numeric" });
    $("statement-content").innerHTML = `<h3>${translateText(s.account)} ${translateText("Statement")}</h3><p>${translateText("Period:")} ${month}</p>${transactionTable(s.items)}`;
    translatePage($("statement-content"));
}
function downloadStatement(id) {
    const s = getStatement(id);
    const rows = [[translateText("Date"), translateText("Description"), translateText("Account"), translateText("Amount")], ...s.items.map(t => [t.date, t.name, translateText(t.account), t.amount])];
    const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = id + ".csv"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function transfer(event) {
    event.preventDefault();
    const from = $("transfer-from").value, to = $("transfer-to").value;
    const amount = Number($("transfer-amount").value);
    if (from === to) return message("transfer-message", "Choose different accounts.", "error");
    if (!Number.isFinite(amount) || amount <= 0) return message("transfer-message", "Enter a valid amount.", "error");
    if (amount > state[from]) return message("transfer-message", "Insufficient demo account balance.", "error");

    state.pendingTransfer = {
        from,
        to,
        amount,
        description: $("transfer-description").value.trim() || "Funds Transfer"
    };
    $("transfer-verify-from").textContent = translateText(accountName(from));
    $("transfer-verify-to").textContent = translateText(accountName(to));
    $("transfer-verify-amount").textContent = money(amount);
    $("transfer-verify-description").textContent = state.pendingTransfer.description;
    $("transfer-message").className = "hidden";
    $("transfer-message").textContent = "";
    $("transfer-entry-step").classList.add("hidden");
    $("transfer-verify-step").classList.remove("hidden");
    translatePage($("transfer-verify-step"));
}

function cancelTransfer() {
    state.pendingTransfer = null;
    $("transfer-verify-step").classList.add("hidden");
    $("transfer-entry-step").classList.remove("hidden");
}

function confirmTransfer() {
    const pending = state.pendingTransfer;
    if (!pending) return;
    if (pending.amount > state[pending.from]) {
        state.pendingTransfer = null;
        $("transfer-verify-step").classList.add("hidden");
        $("transfer-entry-step").classList.remove("hidden");
        return message("transfer-message", "Insufficient demo account balance.", "error");
    }

    const { from, to, amount, description } = pending;
    state[from] = Math.round((state[from] - amount) * 100) / 100;
    state[to] = Math.round((state[to] + amount) * 100) / 100;
    state.transactions.unshift({ date: today(), name: description, account: accountName(from), amount: -amount, category: "Checks Written" });
    state.transactions.unshift({ date: today(), name: description, account: accountName(to), amount, category: "Other Deposits" });
    renderBalances();
    $("transfer-confirm-from").textContent = translateText(accountName(from));
    $("transfer-confirm-to").textContent = translateText(accountName(to));
    $("transfer-confirm-amount").textContent = money(amount);
    $("transfer-form").reset();
    state.pendingTransfer = null;
    $("transfer-verify-step").classList.add("hidden");
    $("transfer-confirm-step").classList.remove("hidden");
    translatePage($("transfer-confirm-step"));
}

function renderPayees(selectedName) {
    const selected = selectedName || $("payee").value || state.payees[0].name;
    $("payee").innerHTML = state.payees.map(payee =>
        `<option value="${esc(payee.name)}" ${payee.name === selected ? "selected" : ""}>${esc(payee.name)}</option>`
    ).join("");
    translatePage($("payee"));
}

function setBillTab(tab) {
    const options = [
        ["saved", "pay-saved-tab", "pay-saved-panel"],
        ["add", "add-payee-tab", "add-payee-panel"],
        ["currency", "foreign-currency-tab", "foreign-currency-panel"]
    ];
    options.forEach(([name, tabId, panelId]) => {
        const active = name === tab;
        $(tabId).classList.toggle("active", active);
        $(tabId).setAttribute("aria-selected", String(active));
        $(panelId).classList.toggle("hidden", !active);
    });
}

function showBillSuccess(text, values = {}) {
    $("bills-success-text").dataset.translationKey = text;
    $("bills-success-text").dataset.translationValues = JSON.stringify(values);
    $("bills-success-text").textContent = translateText(text, values);
    $("bills-success-message").classList.remove("hidden");
    ["bill-message", "add-payee-message", "currency-message"].forEach(id => $(id).classList.add("hidden"));
}

function hideBillSuccess() {
    $("bills-success-message").classList.add("hidden");
}

function payBill(event) {
    event.preventDefault();
    hideBillSuccess();
    const account = $("bill-account").value;
    const amount = Number($("bill-amount").value);
    const payee = $("payee").value;
    if (!Number.isFinite(amount) || amount <= 0) return message("bill-message", "Enter a valid amount.", "error");
    if (amount > state[account]) return message("bill-message", "Insufficient demo account balance.", "error");
    state[account] = Math.round((state[account] - amount) * 100) / 100;
    const category = /Internet|Electric|Water|Telephone/i.test(payee) ? "Telecom" : "Checks Written";
    const description = $("bill-description").value.trim();
    const t = {
        date: $("bill-date").value || today(),
        name: "Bill Payment: " + payee + (description ? " - " + description : ""),
        account: accountName(account), amount: -amount, category
    };
    state.transactions.unshift(t);
    state.bills.unshift(t);
    renderBalances();
    showBillSuccess("Payment of {amount} to {payee} was successful.", { amount: money(amount), payee });
    $("bill-form").reset();
    $("bill-date").value = today();
}

function addPayee(event) {
    event.preventDefault();
    hideBillSuccess();
    const name = $("new-payee-name").value.trim();
    if (state.payees.some(payee => payee.name.toLowerCase() === name.toLowerCase())) {
        return message("add-payee-message", "A payee with this name already exists.", "error");
    }

    state.payees.push({
        name,
        address: $("new-payee-address").value.trim(),
        account: $("new-payee-account").value.trim(),
        details: $("new-payee-details").value.trim()
    });
    renderPayees(name);
    $("add-payee-form").reset();
    showBillSuccess("{name} was added to your saved payees.", { name });
}

function updateCurrencyRate() {
    const currency = $("currency-select").value;
    $("currency-rate").textContent = currency
        ? `1 USD = ${currencyRates[currency].toLocaleString("en-US", { maximumFractionDigits: 4 })} ${currency}`
        : translateText("Select a currency");
}

function invalidateCurrencyCalculation() {
    state.currencyCalculation = null;
    $("purchase-currency-button").disabled = true;
    $("currency-conversion").textContent = translateText("Conversion Amount");
    $("currency-message").classList.add("hidden");
}

function calculateCurrency() {
    hideBillSuccess();
    const currency = $("currency-select").value;
    const inputAmount = Number($("currency-amount").value);
    if (!currency) return message("currency-message", "Select a currency.", "error");
    if (!Number.isFinite(inputAmount) || inputAmount <= 0) {
        return message("currency-message", "Enter a valid amount.", "error");
    }

    const rate = currencyRates[currency];
    const inputType = document.querySelector('input[name="currency-input-type"]:checked').value;
    const roundCents = value => Math.round((value + Number.EPSILON) * 100) / 100;
    const usdAmount = roundCents(inputType === "usd" ? inputAmount : inputAmount / rate);
    const foreignAmount = roundCents(inputType === "usd" ? inputAmount * rate : inputAmount);
    state.currencyCalculation = { currency, rate, usdAmount, foreignAmount };
    $("currency-conversion").textContent = `${translateText("Conversion Amount")}: ${money(usdAmount)} USD = ${foreignAmount.toFixed(2)} ${currency}`;
    $("purchase-currency-button").disabled = false;
    $("currency-message").classList.add("hidden");
}

function purchaseCurrency(event) {
    event.preventDefault();
    hideBillSuccess();
    const purchase = state.currencyCalculation;
    if (!purchase) return message("currency-message", "Calculate the conversion before purchasing.", "error");
    if (purchase.usdAmount > state.checking) {
        return message("currency-message", "Insufficient demo checking balance.", "error");
    }

    state.checking = Math.round((state.checking - purchase.usdAmount) * 100) / 100;
    state.transactions.unshift({
        date: today(),
        name: `Foreign Currency Purchase: ${purchase.foreignAmount.toFixed(2)} ${purchase.currency}`,
        account: "Checking",
        amount: -purchase.usdAmount,
        category: "Travel"
    });
    renderBalances();
    showBillSuccess("Foreign currency cash was successfully purchased: {foreign} {currency} for {amount} from Checking.", {
        foreign: purchase.foreignAmount.toFixed(2),
        currency: purchase.currency,
        amount: money(purchase.usdAmount)
    });
    $("currency-form").reset();
    state.currencyCalculation = null;
    $("purchase-currency-button").disabled = true;
    $("currency-conversion").textContent = translateText("Conversion Amount");
    updateCurrencyRate();
}

function profileFromForm() {
    return {
        ...state.profile,
        username: state.username,
        firstName: $("profile-first-name").value.trim(),
        lastName: $("profile-last-name").value.trim(),
        email: $("profile-email").value.trim(),
        phone: $("profile-phone").value.trim(),
        birthDate: $("profile-birth-date").value,
        address: $("profile-address").value.trim(),
        address2: $("profile-address2").value.trim(),
        city: $("profile-city").value.trim(),
        region: $("profile-region").value.trim(),
        postalCode: $("profile-postal-code").value.trim(),
        country: $("profile-country").value.trim()
    };
}

function renderAccountForms() {
    const profile = state.profile || emptyProfile(state.username);
    $("settings-username").value = state.username;
    $("settings-email").value = profile.email || "";
    $("profile-first-name").value = profile.firstName || "";
    $("profile-last-name").value = profile.lastName || "";
    $("profile-email").value = profile.email || "";
    $("profile-phone").value = profile.phone || "";
    $("profile-birth-date").value = profile.birthDate || "";
    $("profile-address").value = profile.address || "";
    $("profile-address2").value = profile.address2 || "";
    $("profile-city").value = profile.city || "";
    $("profile-region").value = profile.region || "";
    $("profile-postal-code").value = profile.postalCode || "";
    $("profile-country").value = profile.country || "";
    const preferences = userRecords[userKey(state.username)]?.settings || {};
    $("email-notifications").checked = Boolean(preferences.emailNotifications);
    $("security-alerts").checked = Boolean(preferences.securityAlerts);
}

function startDemoSession(username, keepSignedIn) {
    state.loggedIn = true;
    state.username = username;
    state.profile = userRecords[userKey(username)]?.profile || emptyProfile(username);
    if (keepSignedIn) localStorage.setItem("zero-remembered-user", username);
    else localStorage.removeItem("zero-remembered-user");
    renderAccountForms();
    updateLogin();
}

function updateLogin() {
    const currentPage = location.hash.slice(1);
    const homeView = currentPage === "home" || currentPage === "";
    const accountView = accountTabPages.includes(currentPage) ||
        (currentPage === "online-banking" && state.loggedIn);
    $("signin-link").classList.toggle("hidden", state.loggedIn);
    $("create-account-link").classList.toggle("hidden", state.loggedIn);
    $("settings-dropdown").classList.toggle("hidden", !state.loggedIn);
    $("user-dropdown").classList.toggle("hidden", !state.loggedIn);
    $("header-username").textContent = state.username || "User";
    $("keep-signed-in").checked = Boolean(localStorage.getItem("zero-remembered-user"));
    document.querySelector(".nav").classList.toggle("hidden", state.loggedIn && !homeView);
    $("hero").classList.toggle("hidden", !homeView);
    $("account-tabs").classList.toggle("hidden", !state.loggedIn || !accountView);
}

function navigate() {
    let page = location.hash.slice(1) || "home";
    if (page === "checking-account-activity") page = "account-activity";
    if (page === "online-banking" && state.loggedIn) page = "account-summary";

    if (protectedPages.includes(page) && !state.loggedIn) {
        sessionStorage.setItem("zero-pending-page", page);
        history.replaceState(null, "", location.pathname + location.search + "#login");
        page = "login";
    }

    document.querySelectorAll(".page").forEach(p => p.classList.toggle("hidden", p.id !== "page-" + page));
    $("hero").classList.toggle("hidden", page !== "home");

    document.querySelectorAll("[data-nav]").forEach(a => {
        a.classList.toggle("active", a.dataset.nav === page ||
            (accountTabPages.includes(page) && a.dataset.nav === "online-banking"));
    });

    document.querySelectorAll("[data-account-tab]").forEach(a => {
        a.classList.toggle("active", a.dataset.accountTab === page);
    });

    $("search-results").classList.add("hidden");
    updateLogin();
    if (state.loggedIn) {
        renderBalances();
        if (page === "account-settings" || page === "my-profile") renderAccountForms();
    }
}

function globalSearch(event) {
    event.preventDefault();
    const q = $("global-search").value.trim().toLowerCase();
    const results = $("search-results");
    if (!q) { results.classList.add("hidden"); return; }

    const pages = [
        { id: "home", title: "Home" },
        { id: "online-banking", title: "Online Banking" },
        { id: "account-summary", title: "Account Summary" },
        { id: "account-activity", title: "Account Activity" },
        { id: "checking-account-activity", title: "Checking Account Activity" },
        { id: "transfer-funds", title: "Transfer Funds" },
        { id: "pay-bills", title: "Pay Bills" },
        { id: "money-map", title: "My Money Map" },
        { id: "online-statements", title: "Online Statements" },
        { id: "help", title: "Help" },
        { id: "feedback", title: "Feedback" },
        { id: "privacy", title: "Privacy" },
        { id: "account-settings", title: "Account settings" },
        { id: "my-profile", title: "My profile" }
    ];

    const matches = pages.filter(p => {
        const el = $("page-" + (p.id === "checking-account-activity" ? "account-activity" : p.id));
        return (p.title + " " + translateText(p.title) + " " + (el ? el.innerText : "")).toLowerCase().includes(q);
    });

    results.innerHTML = matches.length
        ? matches.map(p => `<a href="#${p.id}">${esc(translateText(p.title))} — ${translateText("Open section")}</a>`).join("")
        : '<div style="padding:12px">No matching sections found.</div>';
    results.classList.remove("hidden");
    translatePage(results);
}

function closeHeaderMenus() {
    [["settings-trigger", "settings-menu"], ["user-trigger", "user-menu"], ["language-trigger", "language-menu"]].forEach(([triggerId, menuId]) => {
        $(triggerId).setAttribute("aria-expanded", "false");
        $(menuId).classList.add("hidden");
    });
}

function toggleHeaderMenu(triggerId, menuId) {
    const menu = $(menuId);
    const willOpen = menu.classList.contains("hidden");
    closeHeaderMenus();
    menu.classList.toggle("hidden", !willOpen);
    $(triggerId).setAttribute("aria-expanded", String(willOpen));
}

function setTopic(buttonSelector, contentSelector, topic, topicAttribute) {
    document.querySelectorAll(buttonSelector).forEach(button => {
        const active = button.dataset[topicAttribute] === topic;
        button.classList.toggle("active", active);
        button.setAttribute("aria-current", String(active));
    });
    document.querySelectorAll(contentSelector).forEach(content => {
        content.hidden = content.dataset[topicAttribute.replace("Topic", "Content")] !== topic;
    });
}

function setHelpTopic(topic) {
    setTopic("[data-help-topic]", "[data-help-content]", topic, "helpTopic");
}

function setPrivacyTopic(topic) {
    setTopic("[data-privacy-topic]", "[data-privacy-content]", topic, "privacyTopic");
}

function setSettingsTopic(topic) {
    setTopic("[data-settings-topic]", "[data-settings-content]", topic, "settingsTopic");
}

$("create-account-form").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const username = String(values.get("username")).trim();
    const password = String(values.get("password"));
    if (password !== String(values.get("passwordConfirm"))) {
        return message("create-account-message", "Passwords do not match.", "error");
    }

    const key = userKey(username);
    if (Object.hasOwn(userRecords, key)) {
        return message("create-account-message", "That username is already in use.", "error");
    }

    try {
        const salt = createPasswordSalt();
        const profile = {
            ...emptyProfile(username),
            firstName: String(values.get("firstName")).trim(),
            lastName: String(values.get("lastName")).trim(),
            email: String(values.get("email")).trim(),
            phone: String(values.get("phone")).trim(),
            birthDate: String(values.get("birthDate")),
            address: String(values.get("address")).trim(),
            address2: String(values.get("address2")).trim(),
            city: String(values.get("city")).trim(),
            region: String(values.get("region")).trim(),
            postalCode: String(values.get("postalCode")).trim(),
            country: String(values.get("country")).trim()
        };
        userRecords[key] = {
            profile,
            settings: { emailNotifications: false, securityAlerts: true },
            passwordSalt: salt,
            passwordHash: await passwordDigest(password, salt)
        };
        try {
            saveUserRecords();
        } catch (error) {
            delete userRecords[key];
            throw error;
        }

        state.profile = profile;
        startDemoSession(username, $("create-keep-signed-in").checked);
        $("create-account-message").className = "hidden";
        form.reset();
        location.hash = "my-profile";
        message("profile-message", "Account created. Your demo session has started.");
    } catch (error) {
        console.error("Unable to create the local demo account.", error);
        message("create-account-message", "An error occurred while saving your account. Please try again.", "error");
    }
});

$("login-form").addEventListener("submit", async event => {
    event.preventDefault();
    const username = $("username").value.trim();
    const password = $("password").value;
    if (!username || !password) return message("login-message", "Enter your username and password.", "error");

    try {
        const account = userRecords[userKey(username)];
        if (account?.passwordHash &&
            await passwordDigest(password, account.passwordSalt) !== account.passwordHash) {
            return message("login-message", "The username or password is incorrect.", "error");
        }
        // Unregistered names continue to use the original local-only demo sign-in.
        startDemoSession(username, $("keep-signed-in").checked);
        message("login-message", "Demo session started.");
        const pending = sessionStorage.getItem("zero-pending-page") || "account-summary";
        sessionStorage.removeItem("zero-pending-page");
        setTimeout(() => location.hash = pending, 250);
    } catch (error) {
        console.error("Unable to verify the local demo account.", error);
        message("login-message", "An error occurred while signing in. Please try again.", "error");
    }
});

$("account-settings-form").addEventListener("submit", async event => {
    event.preventDefault();
    const oldKey = userKey(state.username);
    const username = $("settings-username").value.trim();
    const nextKey = userKey(username);
    const email = $("settings-email").value.trim();
    const currentPassword = $("settings-current-password").value;
    const newPassword = $("settings-new-password").value;
    const confirmPassword = $("settings-confirm-password").value;
    const record = userRecords[oldKey] || { profile: state.profile, settings: {} };

    if (Object.hasOwn(userRecords, nextKey) && nextKey !== oldKey) {
        return message("account-settings-message", "This username already exists.", "error");
    }
    if (newPassword && newPassword !== confirmPassword) {
        return message("account-settings-message", "Passwords do not match.", "error");
    }

    try {
        if (record.passwordHash &&
            await passwordDigest(currentPassword, record.passwordSalt) !== record.passwordHash) {
            return message("account-settings-message", "The username or password is incorrect.", "error");
        }
        const updated = {
            ...record,
            profile: { ...state.profile, username, email },
            settings: record.settings || {}
        };
        if (newPassword) {
            const salt = createPasswordSalt();
            const hash = await passwordDigest(newPassword, salt);
            if (record.passwordHash && hash === await passwordDigest(currentPassword, salt)) {
                return message("account-settings-message", "Your new password must be different from your current password.", "error");
            }
            updated.passwordSalt = salt;
            updated.passwordHash = hash;
        }

        delete userRecords[oldKey];
        userRecords[nextKey] = updated;
        try {
            saveUserRecords();
        } catch (error) {
            delete userRecords[nextKey];
            if (Object.hasOwn(userRecords, oldKey) === false) userRecords[oldKey] = record;
            throw error;
        }
        state.username = username;
        state.profile = updated.profile;
        $("settings-current-password").value = "";
        $("settings-new-password").value = "";
        $("settings-confirm-password").value = "";
        renderAccountForms();
        updateLogin();
        message("account-settings-message", "Account settings saved.");
    } catch (error) {
        console.error("Unable to save local account settings.", error);
        message("account-settings-message", "An error occurred while saving your account. Please try again.", "error");
    }
});

$("profile-form").addEventListener("submit", event => {
    event.preventDefault();
    const key = userKey(state.username);
    const previousProfile = state.profile;
    const previousRecord = userRecords[key];
    state.profile = profileFromForm();
    userRecords[key] = {
        ...(previousRecord || {}),
        profile: state.profile,
        settings: previousRecord?.settings || {}
    };
    try {
        saveUserRecords();
        message("profile-message", "Profile saved.");
    } catch (error) {
        if (previousRecord) userRecords[key] = previousRecord;
        else delete userRecords[key];
        state.profile = previousProfile;
        console.error("Unable to save the local demo profile.", error);
        message("profile-message", "An error occurred while saving your profile. Please try again.", "error");
    }
});

$("preferences-form").addEventListener("submit", event => {
    event.preventDefault();
    const key = userKey(state.username);
    const previousRecord = userRecords[key];
    userRecords[key] = {
        ...(previousRecord || {}),
        profile: state.profile,
        settings: {
            emailNotifications: $("email-notifications").checked,
            securityAlerts: $("security-alerts").checked
        }
    };
    try {
        saveUserRecords();
        message("preferences-message", "Preferences saved.");
    } catch (error) {
        if (previousRecord) userRecords[key] = previousRecord;
        else delete userRecords[key];
        console.error("Unable to save local account preferences.", error);
        message("preferences-message", "An error occurred while saving your preferences. Please try again.", "error");
    }
});

$("forgot-password-form").addEventListener("submit", event => {
    event.preventDefault();
    message("recovery-message", "This is a local demo; no email was sent.");
});

$("logout-button").addEventListener("click", () => {
    state.loggedIn = false;
    state.username = "";
    state.profile = emptyProfile("");
    localStorage.removeItem("zero-remembered-user");
    closeHeaderMenus();
    updateLogin();
    location.hash = "home";
});

$("settings-trigger").addEventListener("click", () => toggleHeaderMenu("settings-trigger", "settings-menu"));
$("user-trigger").addEventListener("click", () => toggleHeaderMenu("user-trigger", "user-menu"));
$("language-trigger").addEventListener("click", () => toggleHeaderMenu("language-trigger", "language-menu"));
$("language-menu").addEventListener("click", event => {
    const option = event.target.closest("[data-language]");
    if (option) setLanguage(option.dataset.language);
});
document.addEventListener("click", event => {
    if (!event.target.closest(".header-dropdown")) closeHeaderMenus();
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeHeaderMenus();
});
["settings-menu", "user-menu"].forEach(menuId => {
    $(menuId).addEventListener("click", event => {
        if (event.target.closest("[data-menu-link]")) closeHeaderMenus();
    });
});
$("help-topics").addEventListener("click", event => {
    const button = event.target.closest("[data-help-topic]");
    if (button) setHelpTopic(button.dataset.helpTopic);
});

$("privacy-topics").addEventListener("click", event => {
    const button = event.target.closest("[data-privacy-topic]");
    if (button) setPrivacyTopic(button.dataset.privacyTopic);
});
$("settings-topics").addEventListener("click", event => {
    const button = event.target.closest("[data-settings-topic]");
    if (button) setSettingsTopic(button.dataset.settingsTopic);
});

$("transfer-form").addEventListener("submit", transfer);
$("transfer-cancel-button").addEventListener("click", cancelTransfer);
$("transfer-confirm-button").addEventListener("click", confirmTransfer);
$("transfer-view-link").addEventListener("click", () => {
    $("activity-account").value = "all";
    setActivityMode("show");
});
$("transfer-another-button").addEventListener("click", () => {
    state.pendingTransfer = null;
    $("transfer-form").reset();
    $("transfer-message").className = "hidden";
    $("transfer-message").textContent = "";
    $("transfer-confirm-step").classList.add("hidden");
    $("transfer-entry-step").classList.remove("hidden");
});
$("pay-saved-tab").addEventListener("click", () => setBillTab("saved"));
$("add-payee-tab").addEventListener("click", () => setBillTab("add"));
$("foreign-currency-tab").addEventListener("click", () => setBillTab("currency"));
$("bills-success-dismiss").addEventListener("click", () => $("bills-success-message").classList.add("hidden"));
$("bill-form").addEventListener("submit", payBill);
$("add-payee-form").addEventListener("submit", addPayee);
$("currency-form").addEventListener("submit", purchaseCurrency);
$("currency-select").addEventListener("change", () => {
    updateCurrencyRate();
    invalidateCurrencyCalculation();
});
$("currency-amount").addEventListener("input", invalidateCurrencyCalculation);
document.querySelectorAll('input[name="currency-input-type"]').forEach(input => {
    input.addEventListener("change", invalidateCurrencyCalculation);
});
$("calculate-currency-button").addEventListener("click", calculateCurrency);
$("statement-search").addEventListener("input", renderStatements);
$("statement-years").addEventListener("click", event => {
    const button = event.target.closest("[data-statement-year]");
    if (!button) return;
    state.statementYear = button.dataset.statementYear;
    renderStatements();
});
$("activity-account").addEventListener("change", renderActivity);
$("show-transactions-tab").addEventListener("click", () => setActivityMode("show"));
$("find-transactions-tab").addEventListener("click", () => setActivityMode("find"));
$("activity-find-form").addEventListener("submit", findTransactions);
$("search-form").addEventListener("submit", globalSearch);
$("global-search").addEventListener("input", globalSearch);
document.addEventListener("click", e => {
    if (!e.target.closest(".search-wrap")) $("search-results").classList.add("hidden");
});
$("feedback-form").addEventListener("submit", e => {
    e.preventDefault();
    e.target.reset();
    message("feedback-message", "Feedback recorded in this demo interface; it was not sent to a server.");
});
$("feedback-form").addEventListener("reset", () => {
    $("feedback-message").className = "hidden";
    $("feedback-message").textContent = "";
});

setHelpTopic("login");
setPrivacyTopic("setting");
setSettingsTopic("security");
if (state.loggedIn) renderAccountForms();
renderPayees();
updateCurrencyRate();
$("bill-date").value = today();
renderStatements();
renderBalances();
updateLogin();
translatePage();
window.addEventListener("hashchange", navigate);
navigate();
