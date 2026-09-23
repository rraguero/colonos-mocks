    (function () {
      "use strict";

      var pageHash = {
        dashboard: "#/inicio",
        fractions: "#/mis-fracciones",
        finance: "#/estado-financiero",
        period: "#/estado-financiero/septiembre-2026",
        payments: "#/pagos",
        "payment-detail": "#/pagos/detalle",
        notifications: "#/notificaciones",
        "style-guide": "#/guia-de-estilos"
      };
      var hashPage = {};
      Object.keys(pageHash).forEach(function (key) { hashPage[pageHash[key]] = key; });
      var lastFocus = null;
      var currentNoticeFilter = "all";

      var publicViews = document.querySelectorAll(".view");
      var appPages = document.querySelectorAll(".page-view");
      var navLinks = document.querySelectorAll("[data-page]");
      var modalBackdrop = document.getElementById("modal-backdrop");
      var modal = document.getElementById("modal");
      var modalTitle = document.getElementById("modal-title");
      var modalBody = document.getElementById("modal-description");
      var modalActions = document.getElementById("modal-actions");
      var sidebar = document.getElementById("sidebar");
      var sidebarBackdrop = document.getElementById("sidebar-backdrop");
      var menuButton = document.getElementById("menu-button");
      var unitPopover = document.getElementById("unit-popover");
      var notificationPopover = document.getElementById("notification-popover");
      var profilePopover = document.getElementById("profile-popover");
      var bootSplash = document.getElementById("boot-splash");

      function playBootSplash() {
        if (!bootSplash) return;
        bootSplash.classList.remove("is-hidden");
        window.setTimeout(function () { bootSplash.classList.add("is-hidden"); }, 900);
      }

      function svgIcon(id) {
        return '<svg class="icon" aria-hidden="true"><use href="#' + id + '"></use></svg>';
      }

      function showRoot(name) {
        publicViews.forEach(function (view) { view.classList.remove("active"); });
        document.getElementById("view-" + name).classList.add("active");
        window.scrollTo(0, 0);
      }

      function closeMenus() {
        unitPopover.classList.remove("open");
        notificationPopover.classList.remove("open");
        profilePopover.classList.remove("open");
        document.getElementById("unit-button").setAttribute("aria-expanded", "false");
        document.getElementById("notification-button").setAttribute("aria-expanded", "false");
        document.getElementById("user-button").setAttribute("aria-expanded", "false");
      }

      function closeDrawer() {
        sidebar.classList.remove("open");
        sidebarBackdrop.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
      }

      function performLogout() {
        closeMenus();
        closeDrawer();
        document.getElementById("terms-check").checked = false;
        document.getElementById("accept-terms").disabled = true;
        showRoot("login");
        history.replaceState(null, "", "#/ingreso");
        toast("info", "Sesión finalizada", "Cerraste la sesión de demostración.");
      }

      function showPage(page, updateHash) {
        showRoot("app");
        appPages.forEach(function (item) { item.classList.toggle("active", item.id === "page-" + page); });
        document.querySelectorAll(".side-nav .nav-link[data-page]").forEach(function (item) {
          item.classList.toggle("active", item.getAttribute("data-page") === page || (page === "period" && item.getAttribute("data-page") === "finance") || (page === "payment-detail" && item.getAttribute("data-page") === "payments"));
        });
        closeMenus();
        closeDrawer();
        if (updateHash !== false && pageHash[page] && location.hash !== pageHash[page]) {
          history.pushState(null, "", pageHash[page]);
        }
        document.getElementById("main-content").focus({preventScroll:true});
        window.scrollTo(0, 0);
      }

      function openDrawer() {
        sidebar.classList.add("open");
        sidebarBackdrop.classList.add("open");
        menuButton.setAttribute("aria-expanded", "true");
        var firstLink = sidebar.querySelector(".nav-link:not(:disabled)");
        if (firstLink) firstLink.focus();
      }

      function toast(type, title, message) {
        var region = document.getElementById("toast-region");
        var item = document.createElement("div");
        item.className = "toast " + type;
        var icon = type === "success" ? "i-check" : type === "warning" || type === "error" ? "i-alert" : "i-info";
        item.innerHTML = svgIcon(icon) + "<div><strong>" + title + "</strong><span>" + message + "</span></div>";
        region.appendChild(item);
        window.setTimeout(function () {
          item.style.opacity = "0";
          window.setTimeout(function () { item.remove(); }, 180);
        }, 3600);
      }

      function actionButton(label, className, handler, autofocus) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "btn " + className;
        button.textContent = label;
        if (autofocus) button.setAttribute("data-autofocus", "true");
        button.addEventListener("click", handler);
        return button;
      }

      function openModal(config) {
        lastFocus = document.activeElement;
        modalTitle.textContent = config.title;
        modalBody.innerHTML = config.body;
        modalActions.innerHTML = "";
        modal.classList.toggle("modal-wide", !!config.wide);
        (config.actions || []).forEach(function (action) {
          modalActions.appendChild(actionButton(action.label, action.className || "btn-secondary", function () {
            if (action.onClick) action.onClick();
            if (action.close !== false) closeModal();
          }, action.autofocus));
        });
        modalBackdrop.classList.add("open");
        document.body.classList.add("modal-open");
        var target = modal.querySelector("[data-autofocus]") || modal.querySelector("button, input, select, textarea, a[href]");
        if (target) window.setTimeout(function () { target.focus(); }, 20);
      }

      function closeModal() {
        modalBackdrop.classList.remove("open");
        document.body.classList.remove("modal-open");
        modal.classList.remove("modal-wide");
        if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
      }

      function modalByName(name) {
        closeMenus();
        var configs = {
          help: {
            title: "¿Necesitás ayuda?",
            body: '<p>Esta maqueta no está conectada a un servicio de soporte real.</p><div class="alert alert-info">' + svgIcon("i-info") + '<div><h3>Canal demostrativo</h3><p>En la versión final se informarán los canales oficiales del Instituto y los horarios de atención.</p></div></div>',
            actions: [{label:"Entendido", className:"btn-primary", autofocus:true}]
          },
          profile: {
            title: "Mi perfil",
            body: '<div class="detail-list"><div class="detail-item"><span>Nombre</span><strong>María Pérez</strong></div><div class="detail-item"><span>Documento</span><strong>CI ••••4567</strong></div><div class="detail-item"><span>Rol</span><strong>Titular · Colono</strong></div><div class="detail-item"><span>Unidad productiva</span><strong>La Esperanza</strong></div></div><p class="demo-caption">Datos ficticios utilizados exclusivamente para esta demostración.</p>',
            actions: [{label:"Cerrar", className:"btn-primary", autofocus:true}]
          },
          "notification-preferences": {
            title: "Preferencias de notificaciones",
            body: '<p>Elegí cómo querés recibir las novedades del portal.</p><label class="check-row"><input type="checkbox" checked><span><strong>Notificaciones dentro del portal</strong><br><span style="color:var(--muted)">Vencimientos, pagos y avisos institucionales.</span></span></label><label class="check-row" style="margin-top:10px"><input type="checkbox" checked><span><strong>Correo electrónico</strong><br><span style="color:var(--muted)">Resumen de avisos importantes.</span></span></label>',
            actions: [{label:"Cancelar", className:"btn-secondary"}, {label:"Guardar preferencias", className:"btn-primary", autofocus:true, onClick:function(){ toast("success", "Preferencias guardadas", "Las preferencias se actualizaron en la demostración."); }}]
          },
          "terms-decline": {
            title: "No podrás ingresar al portal",
            body: "<p>Para utilizar los servicios del Portal de Colonos es necesario aceptar los términos y condiciones vigentes.</p>",
            actions: [
              {label:"Volver", className:"btn-secondary", autofocus:true},
              {label:"Salir del portal", className:"btn-danger", onClick:function(){ showRoot("login"); history.replaceState(null, "", "#/ingreso"); }}
            ]
          },
          "rent-calc": {
            title: "Cálculo demostrativo de renta",
            wide: true,
            body: '<div class="alert alert-info">' + svgIcon("i-info") + '<div><h3>Información de demostración</h3><p>Los valores y coeficientes no representan un cálculo oficial.</p></div></div><div class="calc-grid"><div>Superficie considerada</div><div>24,5 ha</div><div>Valor base demostrativo</div><div>UYU 14.800</div><div>Coeficiente del período</div><div>1,0811</div><div>Ajustes</div><div>UYU 450</div><div>Bonificaciones</div><div>UYU 0</div><div class="calc-total">Resultado final de renta</div><div class="calc-total">UYU 16.000</div></div>',
            actions: [{label:"Cerrar", className:"btn-primary", autofocus:true}]
          },
          bill: {
            title: "Boleta del período",
            body: '<div class="component-demo"><span class="eyebrow">Documento demostrativo</span><h3 style="margin-top:8px">Fracción 12 · Septiembre 2026</h3><div class="concept-row"><span>Vencimiento</span><strong>30/09/2026</strong></div><div class="concept-row"><span>Total</span><strong>UYU 18.450</strong></div></div><p class="demo-caption">Esta vista no constituye una boleta válida para pago.</p>',
            actions: [{label:"Volver", className:"btn-secondary"}, {label:"Descargar copia demo", className:"btn-primary", autofocus:true, onClick:function(){ downloadText("boleta_demo_septiembre_2026.txt", receiptText("Boleta demostrativa", "Septiembre 2026", "UYU 18.450")); }}]
          },
          order: {
            title: "Revisá la orden de pago",
            body: '<div class="alert alert-warning">' + svgIcon("i-alert") + '<div><h3>Simulación sin pago real</h3><p>Esta acción no se conecta con una pasarela y no genera cargos.</p></div></div><div class="detail-list"><div class="detail-item"><span>Fracción</span><strong>Fracción 12</strong></div><div class="detail-item"><span>Período</span><strong>Septiembre 2026</strong></div><div class="detail-item"><span>Vencimiento</span><strong>30/09/2026</strong></div><div class="detail-item"><span>Total</span><strong>UYU 18.450</strong></div></div>',
            actions: [{label:"Volver", className:"btn-secondary"}, {label:"Confirmar simulación", className:"btn-primary", autofocus:true, onClick:function(){ toast("info", "Orden simulada", "La demostración terminó antes de conectarse a una pasarela."); }}]
          },
          confirmation: {
            title: "¿Confirmás esta operación?",
            body: "<p>Revisá la información antes de continuar con la acción demostrativa.</p>",
            actions: [{label:"Volver", className:"btn-secondary"}, {label:"Confirmar", className:"btn-primary", autofocus:true, onClick:function(){ toast("success", "Operación confirmada", "La acción demostrativa se completó correctamente."); }}]
          },
          cancel: {
            title: "¿Querés cancelar el proceso?",
            body: "<p>Los datos que todavía no se hayan guardado se descartarán.</p>",
            actions: [{label:"Continuar", className:"btn-secondary", autofocus:true}, {label:"Cancelar proceso", className:"btn-warning", onClick:function(){ toast("warning", "Proceso cancelado", "La demostración volvió al estado anterior."); }}]
          },
          reject: {
            title: "Rechazar solicitud",
            body: '<div class="field"><label for="reject-reason">Motivo del rechazo</label><textarea id="reject-reason" class="textarea" placeholder="Ingresá un motivo claro"></textarea><span id="reject-error" class="field-error" hidden>El motivo es obligatorio.</span></div>',
            actions: [
              {label:"Volver", className:"btn-secondary"},
              {label:"Rechazar", className:"btn-danger", autofocus:true, close:false, onClick:function(){
                var field = document.getElementById("reject-reason");
                var error = document.getElementById("reject-error");
                if (!field.value.trim()) { error.hidden = false; field.classList.add("input-error"); field.focus(); return; }
                closeModal(); toast("error", "Solicitud rechazada", "El motivo quedó registrado en la demostración.");
              }}
            ]
          },
          destructive: {
            title: "Revocar acceso",
            body: '<div class="alert alert-error">' + svgIcon("i-alert") + '<div><h3>Esta acción tiene consecuencias</h3><p>La persona dejará de acceder a la información delegada. Esta maqueta no modifica permisos reales.</p></div></div>',
            actions: [{label:"Conservar acceso", className:"btn-secondary", autofocus:true}, {label:"Revocar acceso", className:"btn-danger", onClick:function(){ toast("error", "Acceso revocado", "El cambio fue simulado correctamente."); }}]
          }
        };
        if (configs[name]) openModal(configs[name]);
      }

      function receiptText(title, period, amount) {
        return "INSTITUTO NACIONAL DE COLONIZACIÓN\\n" + title + "\\n\\nTitular: María Pérez\\nDocumento: CI ••••4567\\nFracción: 12\\nContrato: ARR-4587\\nPeríodo: " + period + "\\nImporte: " + amount + "\\n\\nDOCUMENTO DEMOSTRATIVO - SIN VALIDEZ OFICIAL";
      }

      function downloadText(filename, content, mime) {
        var blob = new Blob([content], {type:mime || "text/plain;charset=utf-8"});
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        toast("success", "Descarga preparada", "Se generó un archivo exclusivamente demostrativo.");
      }

      function updateNotificationCount() {
        var unread = document.querySelectorAll("[data-notice][data-read='false']").length;
        document.getElementById("notification-counter").textContent = unread;
        document.getElementById("notification-counter").style.display = unread ? "grid" : "none";
        document.getElementById("notification-button").setAttribute("aria-label", "Abrir notificaciones, " + unread + " sin leer");
        document.querySelectorAll(".nav-notice-count").forEach(function (item) { item.textContent = unread; item.style.display = unread ? "inline-flex" : "none"; });
        filterNotices(currentNoticeFilter);
      }

      function markNoticeRead(item) {
        item.setAttribute("data-read", "true");
        item.classList.remove("unread");
        var button = item.querySelector("[data-mark-read]");
        if (button) button.remove();
        updateNotificationCount();
        toast("success", "Notificación actualizada", "Se marcó como leída.");
      }

      function markAllRead() {
        document.querySelectorAll("[data-notice]").forEach(function (item) {
          item.setAttribute("data-read", "true");
          item.classList.remove("unread");
          var button = item.querySelector("[data-mark-read]");
          if (button) button.remove();
        });
        document.querySelectorAll(".mini-notice").forEach(function (item) { item.classList.remove("unread"); var dot = item.querySelector(".dot"); if (dot) dot.remove(); });
        updateNotificationCount();
        toast("success", "Notificaciones actualizadas", "Todas quedaron marcadas como leídas.");
      }

      function filterNotices(filter) {
        currentNoticeFilter = filter;
        var visible = 0;
        document.querySelectorAll("[data-notice]").forEach(function (item) {
          var show = filter === "all" || item.getAttribute("data-read") === "false";
          item.style.display = show ? "flex" : "none";
          if (show) visible++;
        });
        document.getElementById("notices-empty").style.display = visible ? "none" : "block";
      }

      function filterFinance() {
        var fraction = document.getElementById("finance-fraction").value;
        var year = document.getElementById("finance-year").value;
        var status = document.getElementById("finance-status").value;
        var search = document.getElementById("finance-search").value.trim().toLowerCase();
        var visible = 0;
        document.querySelectorAll("#finance-rows tr").forEach(function (row) {
          var show = (fraction === "all" || row.dataset.fraction === fraction) &&
            (year === "all" || row.dataset.year === year) &&
            (status === "all" || row.dataset.status === status) &&
            (!search || row.dataset.search.indexOf(search) !== -1);
          row.style.display = show ? "" : "none";
          if (show) visible++;
        });
        document.querySelector("#page-finance .data-table").style.display = visible ? "table" : "none";
        document.getElementById("finance-empty").style.display = visible ? "none" : "block";
      }

      function clearFinance() {
        document.getElementById("finance-fraction").value = "12";
        document.getElementById("finance-year").value = "2026";
        document.getElementById("finance-status").value = "all";
        document.getElementById("finance-search").value = "";
        filterFinance();
      }

      function filterPayments() {
        var fraction = document.getElementById("pay-fraction").value;
        var status = document.getElementById("pay-status").value;
        var method = document.getElementById("pay-method").value;
        var visible = 0;
        document.querySelectorAll("#payment-rows tr").forEach(function (row) {
          var show = (fraction === "all" || row.dataset.fraction === fraction) &&
            (status === "all" || row.dataset.status === status) &&
            (method === "all" || row.dataset.method === method);
          row.style.display = show ? "" : "none";
          if (show) visible++;
        });
        document.querySelector("#page-payments .data-table").style.display = visible ? "table" : "none";
        document.getElementById("payments-empty").style.display = visible ? "none" : "block";
      }

      function clearPayments() {
        document.getElementById("pay-from").value = "2026-04-01";
        document.getElementById("pay-fraction").value = "all";
        document.getElementById("pay-status").value = "all";
        document.getElementById("pay-method").value = "all";
        filterPayments();
      }

      var paymentStates = {
        confirmado: {title:"Pago confirmado", message:"Recibimos correctamente tu pago. Estamos esperando que sea aplicado en el sistema financiero del INC.", alert:"alert-info", badge:"blue", step:3, document:"Ver comprobante", retry:false, support:false},
        aplicado: {title:"Pago aplicado", message:"Tu pago fue procesado correctamente y tu estado de cuenta ya fue actualizado.", alert:"alert-success", badge:"green", step:6, document:"Descargar recibo", retry:false, support:false},
        rechazado: {title:"Pago rechazado", message:"No fue posible aprobar la operación. No se realizó ningún cargo desde el Portal.", alert:"alert-error", badge:"red", step:2, document:null, retry:true, support:true},
        verificacion: {title:"Pendiente de verificación", message:"Todavía no recibimos una confirmación definitiva. No vuelvas a pagar esta orden hasta que finalice la verificación.", alert:"alert-warning", badge:"orange", step:2, document:null, retry:false, support:true},
        incidencia: {title:"Pago con incidencia", message:"El pago fue confirmado, pero todavía no pudo aplicarse. No es necesario que vuelvas a pagar.", alert:"alert-warning", badge:"orange", step:4, document:"Ver comprobante", retry:false, support:true},
        cancelado: {title:"Operación cancelada", message:"Saliste de la pasarela antes de completar el pago. Tu orden continúa pendiente.", alert:"alert-info", badge:"gray", step:2, document:null, retry:true, support:false}
      };
      var timelineLabels = ["Orden creada", "Enviada a la pasarela", "Pago confirmado", "Aplicando en el sistema financiero del INC", "Pago aplicado", "Recibo disponible"];

      function setPaymentState(state) {
        var data = paymentStates[state] || paymentStates.aplicado;
        document.getElementById("demo-payment-state").value = state;
        document.getElementById("payment-status-title").textContent = data.title;
        document.getElementById("payment-status-message").textContent = data.message;
        var alert = document.getElementById("payment-status-alert");
        alert.className = "alert " + data.alert;
        var documentButton = document.getElementById("payment-document-button");
        documentButton.hidden = !data.document;
        if (data.document) documentButton.textContent = data.document;
        document.getElementById("payment-retry-button").hidden = !data.retry;
        document.getElementById("payment-support").style.display = data.support ? "block" : "none";
        var timeline = document.getElementById("payment-timeline");
        timeline.innerHTML = "";
        timelineLabels.forEach(function (label, index) {
          var step = index + 1;
          var item = document.createElement("div");
          item.className = "timeline-item " + (step < data.step ? "done" : step === data.step ? "current" : "");
          var stateText = step < data.step ? "Completado" : step === data.step ? "Estado actual" : "Pendiente";
          item.innerHTML = '<span class="timeline-marker">' + step + '</span><div class="timeline-copy"><strong>' + label + '</strong><span>' + stateText + '</span></div>';
          timeline.appendChild(item);
        });
      }

      document.addEventListener("click", function (event) {
        var pageButton = event.target.closest("[data-page]");
        if (pageButton) { showPage(pageButton.getAttribute("data-page")); return; }

        var pageLink = event.target.closest("[data-page-link]");
        if (pageLink) { event.preventDefault(); showPage(pageLink.getAttribute("data-page-link")); return; }

        var go = event.target.closest("[data-go]");
        if (go) { showRoot(go.getAttribute("data-go")); history.pushState(null, "", "#/" + go.getAttribute("data-go")); return; }

        var modalButton = event.target.closest("[data-modal]");
        if (modalButton) { event.preventDefault(); modalByName(modalButton.getAttribute("data-modal")); return; }

        var downloadButton = event.target.closest("[data-download]");
        if (downloadButton) {
          var type = downloadButton.getAttribute("data-download");
          if (type === "statement") {
            downloadText("estado_cuenta_demo_2026.csv", "Periodo,Fraccion,Estado,Importe\\nSeptiembre 2026,12,Pendiente,18450\\nJulio 2026,12,Pagado,17900\\nJunio 2026,12,Pagado,17650\\nMayo 2026,12,Rechazado,17300", "text/csv;charset=utf-8");
          } else {
            downloadText("recibo_demo_PG-2026-001198.txt", receiptText("Recibo de pago", "Julio 2026", "UYU 17.900"));
          }
          return;
        }

        var paymentStateButton = event.target.closest("[data-payment-state]");
        if (paymentStateButton) { setPaymentState(paymentStateButton.getAttribute("data-payment-state")); showPage("payment-detail"); return; }

        var markButton = event.target.closest("[data-mark-read]");
        if (markButton) { markNoticeRead(markButton.closest("[data-notice]")); return; }

        var toastButton = event.target.closest("[data-toast]");
        if (toastButton) {
          var typeName = toastButton.getAttribute("data-toast");
          var titles = {success:"Acción completada", info:"Información", warning:"Revisá esta acción", error:"No se pudo completar"};
          toast(typeName, titles[typeName], "Respuesta funcional de la guía de estilos.");
          return;
        }

        var guideTab = event.target.closest("[data-guide-tab]");
        if (guideTab) {
          document.querySelectorAll("[data-guide-tab]").forEach(function (item) { item.setAttribute("aria-selected", item === guideTab ? "true" : "false"); });
          document.getElementById("guide-tab-content").textContent = guideTab.getAttribute("data-guide-tab") === "summary" ? "Contenido resumido del ejemplo." : "Contenido detallado del ejemplo seleccionado.";
          return;
        }

        var demoPage = event.target.closest("[data-demo-page]");
        if (demoPage) {
          document.querySelectorAll("[data-demo-page]").forEach(function (item) { item.classList.toggle("active", item === demoPage); });
          toast("info", "Página " + demoPage.getAttribute("data-demo-page"), "La paginación cambió dentro de la demostración.");
          return;
        }

        if (!event.target.closest(".popover") && !event.target.closest("#unit-button") && !event.target.closest("#notification-button") && !event.target.closest("#user-button")) closeMenus();
      });

      document.querySelector(".modal-close").addEventListener("click", closeModal);
      modalBackdrop.addEventListener("click", function (event) { if (event.target === modalBackdrop) closeModal(); });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          if (modalBackdrop.classList.contains("open")) closeModal();
          else { closeMenus(); closeDrawer(); }
        }
        if (event.key === "Tab" && modalBackdrop.classList.contains("open")) {
          var focusable = Array.from(modal.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'));
          if (!focusable.length) return;
          var first = focusable[0], last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      });

      document.getElementById("login-button").addEventListener("click", function () {
        var button = this;
        button.classList.add("btn-loading");
        button.disabled = true;
        button.querySelector(".button-label").textContent = "Ingresando de forma segura…";
        window.setTimeout(function () {
          button.classList.remove("btn-loading");
          button.disabled = false;
          button.querySelector(".button-label").textContent = "Ingresar con ID Uruguay";
          showRoot("terms");
          history.pushState(null, "", "#/terms");
        }, 700);
      });

      document.getElementById("terms-check").addEventListener("change", function () {
        document.getElementById("accept-terms").disabled = !this.checked;
      });
      document.getElementById("accept-terms").addEventListener("click", function () {
        showPage("dashboard");
        toast("success", "Acceso simulado", "Ingresaste correctamente al Portal de Colonos.");
      });

      menuButton.addEventListener("click", function () { sidebar.classList.contains("open") ? closeDrawer() : openDrawer(); });
      sidebarBackdrop.addEventListener("click", closeDrawer);

      document.getElementById("theme-toggle-button").addEventListener("click", function () {
        var isAlt = document.documentElement.classList.toggle("theme-brand-b");
        this.setAttribute("aria-pressed", String(isAlt));
        toast("info", isAlt ? "Paleta alternativa" : "Paleta institucional", isAlt ? "Vista previa con el color del manual de marca." : "Volviste a la paleta institucional original.");
      });

      document.getElementById("unit-button").addEventListener("click", function () {
        var opening = !unitPopover.classList.contains("open");
        closeMenus();
        if (opening) { unitPopover.classList.add("open"); this.setAttribute("aria-expanded", "true"); }
      });
      document.querySelectorAll("[data-unit]").forEach(function (button) {
        button.addEventListener("click", function () {
          var label = this.getAttribute("data-unit");
          document.getElementById("unit-name").textContent = label;
          document.getElementById("unit-button").setAttribute("aria-label", "Seleccionar unidad productiva. Actual: " + label.replace(/ · /g, ", "));
          document.querySelectorAll("[data-unit]").forEach(function (item) { item.setAttribute("aria-checked", item === button ? "true" : "false"); });
          closeMenus();
          document.getElementById("unit-button").focus();
          toast("success", "Unidad seleccionada", "Ahora estás consultando " + label + ".");
        });
      });
      document.getElementById("notification-button").addEventListener("click", function () {
        var opening = !notificationPopover.classList.contains("open");
        closeMenus();
        if (opening) { notificationPopover.classList.add("open"); this.setAttribute("aria-expanded", "true"); }
      });
      document.getElementById("user-button").addEventListener("click", function () {
        var opening = !profilePopover.classList.contains("open");
        closeMenus();
        if (opening) { profilePopover.classList.add("open"); this.setAttribute("aria-expanded", "true"); }
      });
      document.getElementById("logout-button").addEventListener("click", performLogout);
      document.getElementById("header-logout-button").addEventListener("click", performLogout);

      document.querySelectorAll("[data-fraction-tab]").forEach(function (button) {
        button.addEventListener("click", function () {
          var tab = this.getAttribute("data-fraction-tab");
          document.querySelectorAll("[data-fraction-tab]").forEach(function (item) { item.setAttribute("aria-selected", item === button ? "true" : "false"); });
          document.getElementById("fractions-active").hidden = tab !== "active";
          document.getElementById("fractions-history").hidden = tab !== "history";
        });
      });

      document.querySelector("[data-fraccion13]").addEventListener("click", function () {
        toast("success", "Sin saldo pendiente", "La Fracción 13 no presenta períodos pendientes.");
        document.getElementById("finance-fraction").value = "13";
        filterFinance();
        showPage("finance");
      });
      document.querySelector("[data-historical-payments]").addEventListener("click", function () {
        showPage("payments");
        document.getElementById("pay-fraction").value = "8";
        filterPayments();
      });

      ["finance-fraction","finance-year","finance-status"].forEach(function (id) { document.getElementById(id).addEventListener("change", filterFinance); });
      document.getElementById("finance-search").addEventListener("input", filterFinance);
      document.getElementById("clear-finance").addEventListener("click", clearFinance);
      document.getElementById("empty-clear-finance").addEventListener("click", clearFinance);

      ["pay-fraction","pay-status","pay-method"].forEach(function (id) { document.getElementById(id).addEventListener("change", filterPayments); });
      document.getElementById("clear-payments").addEventListener("click", clearPayments);
      document.getElementById("empty-clear-payments").addEventListener("click", clearPayments);

      document.getElementById("demo-payment-state").addEventListener("change", function () { setPaymentState(this.value); });

      document.querySelectorAll("[data-notice-filter]").forEach(function (button) {
        button.addEventListener("click", function () {
          document.querySelectorAll("[data-notice-filter]").forEach(function (item) { item.setAttribute("aria-selected", item === button ? "true" : "false"); });
          filterNotices(this.getAttribute("data-notice-filter"));
        });
      });
      document.getElementById("mark-all-read").addEventListener("click", markAllRead);
      document.getElementById("panel-mark-all").addEventListener("click", function () { markAllRead(); closeMenus(); });

      document.getElementById("demo-textarea").addEventListener("input", function () { document.getElementById("textarea-count").textContent = this.value.length + " / 180"; });

      var replayBootSplashButton = document.getElementById("replay-boot-splash");
      if (replayBootSplashButton) replayBootSplashButton.addEventListener("click", playBootSplash);

      window.addEventListener("hashchange", function () {
        var page = hashPage[location.hash];
        if (page) showPage(page, false);
        else if (location.hash === "#/terms") showRoot("terms");
        else if (location.hash === "#/ingreso" || !location.hash) showRoot("login");
      });

      window.addEventListener("resize", function () { if (window.innerWidth > 820) closeDrawer(); });

      setPaymentState("aplicado");
      updateNotificationCount();
      filterFinance();
      filterPayments();
      if (hashPage[location.hash]) showPage(hashPage[location.hash], false);
      else if (location.hash === "#/terms") showRoot("terms");
      else { showRoot("login"); if (!location.hash) history.replaceState(null, "", "#/ingreso"); }

      playBootSplash();
    }());
