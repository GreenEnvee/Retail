(function () {
  const TURNSTILE_SCRIPT_SRC =
    "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
  const THANK_YOU_URLS = {
    professionalOrSchoolDefault: "https://greenenvee.com/pages/thank-you-liv",
    professionalOrSchoolIL: "https://greenenvee.com/pages/thank-you-nicky",
    student: "https://greenenvee.com/pages/thank-you-page-student-account",
  };

  const STEP_DEFINITIONS = [
    { id: "step-1", number: 1, title: "Account setup" },
    { id: "step-2", number: 2, title: "Professional overview" },
    { id: "step-3", number: 3, title: "School overview" },
    { id: "step-student-video", number: 4, title: "Student overview" },
    { id: "step-4", number: 5, title: "Contact details" },
    { id: "step-5", number: 6, title: "Business profile" },
    { id: "step-6", number: 7, title: "Sales goals" },
    { id: "step-7", number: 8, title: "Uploads" },
    { id: "step-8", number: 9, title: "Policies" },
  ];

  const BRANCH_STEP_MAP = {
    "Professional Account": ["step-1", "step-2", "step-4", "step-5", "step-6", "step-7", "step-8"],
    "School Account": ["step-1", "step-3", "step-4", "step-5", "step-6", "step-7", "step-8"],
    "Student Account": ["step-1", "step-student-video", "step-4", "step-7", "step-8"],
    default: ["step-1", "step-2", "step-4", "step-5", "step-6", "step-7", "step-8"],
  };
  const FILE_FIELD_NAMES = new Set([
    "upload_business_license",
    "upload_professional_license",
    "upload_your_state_tax_resale_certificate",
    "upload_proof_of_validaccredited_esthetic_school",
    "upload_copy_of_apprentice_license_or_proof_of_enrollment",
  ]);
  const WHITESPACE_NORMALIZED_FIELD_NAMES = new Set([
    "name",
    "firstname",
    "lastname",
    "address",
    "address2",
    "city",
  ]);
  const SMART_CASE_FIELD_NAMES = new Set([
    "name",
    "firstname",
    "lastname",
    "address",
    "address2",
    "city",
  ]);
  const ADDRESS_UPPERCASE_WORDS = new Set(["ne", "nw", "po", "se", "sw"]);

  let turnstileApiPromise = null;

  function ensureTurnstileApi() {
    if (window.turnstile && typeof window.turnstile.render === "function") {
      return Promise.resolve(window.turnstile);
    }

    if (turnstileApiPromise) {
      return turnstileApiPromise;
    }

    turnstileApiPromise = new Promise((resolve, reject) => {
      const handleLoad = () => {
        if (window.turnstile && typeof window.turnstile.render === "function") {
          resolve(window.turnstile);
          return;
        }

        reject(new Error("Turnstile API failed to initialize."));
      };

      const handleError = () => {
        reject(new Error("Turnstile API failed to load."));
      };

      const existingScript = document.querySelector(
        "script[data-green-envee-turnstile]",
      );

      if (existingScript) {
        existingScript.addEventListener("load", handleLoad, { once: true });
        existingScript.addEventListener("error", handleError, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.async = true;
      script.defer = true;
      script.dataset.greenEnveeTurnstile = "true";
      script.src = TURNSTILE_SCRIPT_SRC;
      script.addEventListener("load", handleLoad, { once: true });
      script.addEventListener("error", handleError, { once: true });
      document.head.appendChild(script);
    });

    return turnstileApiPromise;
  }

  function getCookieValue(name) {
    const prefix = `${name}=`;
    const cookie = document.cookie
      .split(";")
      .map((value) => value.trim())
      .find((value) => value.startsWith(prefix));

    if (!cookie) {
      return "";
    }

    return decodeURIComponent(cookie.slice(prefix.length));
  }

  function normalizeUrlValue(value) {
    const trimmed = value.trim();

    if (!trimmed) {
      return trimmed;
    }

    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    return `https://${trimmed}`;
  }

  function normalizeEmailValue(value) {
    return value.trim().toLowerCase();
  }

  function hasUniformLetterCase(value) {
    const letters = value.match(/\p{L}/gu);

    if (!letters) {
      return false;
    }

    const letterString = letters.join("");
    return letterString === letterString.toLowerCase() || letterString === letterString.toUpperCase();
  }

  function titleCaseSegment(segment) {
    const titled = segment
      .toLowerCase()
      .replace(/^(\P{L}*)(\p{L})/u, (_, prefix, firstLetter) => `${prefix}${firstLetter.toUpperCase()}`);

    return titled.replace(/^Mc(\p{L})/u, (_, firstLetter) => `Mc${firstLetter.toUpperCase()}`);
  }

  function normalizeFormattedFieldValue(fieldName, value) {
    if (fieldName === "email") {
      return normalizeEmailValue(value);
    }

    if (!WHITESPACE_NORMALIZED_FIELD_NAMES.has(fieldName)) {
      return value;
    }

    const normalizedWhitespace = value.trim().replace(/\s+/gu, " ");

    if (!SMART_CASE_FIELD_NAMES.has(fieldName) || !hasUniformLetterCase(normalizedWhitespace)) {
      return normalizedWhitespace;
    }

    return normalizedWhitespace
      .split(" ")
      .map((word) => {
        const normalizedWord = word.toLowerCase();

        if (
          (fieldName === "address" || fieldName === "address2") &&
          ADDRESS_UPPERCASE_WORDS.has(normalizedWord)
        ) {
          return normalizedWord.toUpperCase();
        }

        return word
          .split(/([-'’])/u)
          .map((segment) =>
            segment === "-" || segment === "'" || segment === "’"
              ? segment
              : titleCaseSegment(segment),
          )
          .join("");
      })
      .join(" ");
  }

  function createAttemptId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return `ge-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function initGreenEnveeForm(form) {
    if (!form || form.dataset.geFormInitialized === "true") {
      return;
    }

    form.dataset.geFormInitialized = "true";

    const section = form.closest("[data-section-id]");
    const progressBar = form.querySelector("[data-progress-bar]");
    const feedback = form.querySelector("[data-form-feedback]");
    const submitStatus = form.querySelector("[data-submit-status]");
    const backButton = form.querySelector("[data-back-button]");
    const nextButton = form.querySelector("[data-next-button]");
    const submitButton = form.querySelector("[data-submit-button]");
    const turnstileWrapper = form.querySelector("[data-turnstile-wrapper]");
    const turnstileContainer = form.querySelector("[data-turnstile-container]");
    const steps = new Map(
      [...form.querySelectorAll("[data-step-id]")].map((step) => [step.dataset.stepId, step]),
    );
    const debugMode = new URLSearchParams(window.location.search).has("debugSubmission");
    const apiEndpoint = form.dataset.apiEndpoint || "";
    const turnstileSiteKey = (form.dataset.turnstileSiteKey || "").trim();
    const isDesignMode =
      (window.Shopify && Shopify.designMode) ||
      (section && section.dataset.designMode === "true");

    let currentStepIndex = 0;
    let turnstileWidgetId = null;
    let turnstileLoadFailed = false;
    let currentSubmissionAttemptId = "";

    function getAccountType() {
      return form.elements.namedItem("pro_website_account_applied_for").value || "";
    }

    function getVisibleStepIds() {
      return BRANCH_STEP_MAP[getAccountType()] || BRANCH_STEP_MAP.default;
    }

    function getSuccessRedirectUrl() {
      const accountType = getAccountType();
      const selectedState = (form.elements.namedItem("hs_state_code").value || "").trim().toUpperCase();

      if (accountType === "Student Account") {
        return THANK_YOU_URLS.student;
      }

      if (
        accountType === "Professional Account" ||
        accountType === "School Account"
      ) {
        return selectedState === "IL"
          ? THANK_YOU_URLS.professionalOrSchoolIL
          : THANK_YOU_URLS.professionalOrSchoolDefault;
      }

      return THANK_YOU_URLS.professionalOrSchoolDefault;
    }

    function setFeedback(message, type) {
      feedback.textContent = message;
      feedback.className = "ge-form-feedback";

      if (type) {
        feedback.classList.add(type);
      }
    }

    function setFeedbackHtml(message, type) {
      feedback.innerHTML = message;
      feedback.className = "ge-form-feedback";

      if (type) {
        feedback.classList.add(type);
      }
    }

    function appendSubmissionMetadata(formData) {
      const branch = getAccountType();

      formData.set("branch", branch);
      formData.set("pageUrl", window.location.href);
      formData.set("pageTitle", document.title);
      formData.set("submissionAttemptId", currentSubmissionAttemptId);
      formData.set("email", normalizeEmailValue(formData.get("email") || ""));
      formData.set("website", normalizeUrlValue(formData.get("website") || ""));
      formData.set("instagram_url", normalizeUrlValue(formData.get("instagram_url") || ""));

      const hutk = getCookieValue("hubspotutk");

      if (hutk) {
        formData.set("hutk", hutk);
      }
    }

    function handleSuccessfulSubmissionRedirect() {
      const redirectUrl = getSuccessRedirectUrl();

      setFeedback("Application submitted successfully. Redirecting...", "ge-is-success");
      window.location.assign(redirectUrl);

      window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          setFeedbackHtml(
            `Application submitted successfully. If you are not redirected, <a href="${redirectUrl}">continue here</a>.`,
            "ge-is-success",
          );
          window.location.replace(redirectUrl);
        }
      }, 1500);
    }

    function getFieldLabel(fieldName) {
      if (fieldName === "turnstile") {
        return "Spam protection";
      }

      const field = form.elements.namedItem(fieldName);

      if (!field) {
        return fieldName;
      }

      const container = field.closest(".ge-field, .ge-fieldset, .ge-field-inline");
      const label = container && container.querySelector(".ge-field__label, legend");

      if (!label) {
        return fieldName;
      }

      return label.textContent.replace(/\*/g, "").trim();
    }

    function renderServerErrors(errors) {
      const entries = Object.entries(errors || {});

      if (entries.length === 0) {
        setFeedback("Submission failed.");
        return;
      }

      const firstEntry = entries[0];
      const firstKey = firstEntry[0];
      const firstMessage = firstEntry[1];

      if (firstKey === "_global") {
        setFeedback(firstMessage);
        return;
      }

      setFeedback(`${getFieldLabel(firstKey)}: ${firstMessage}`);
    }

    function summarizeFormData(formData) {
      const summary = {};

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          summary[key] = {
            name: value.name,
            size: value.size,
            type: value.type,
          };
          continue;
        }

        if (Object.prototype.hasOwnProperty.call(summary, key)) {
          const existing = summary[key];
          summary[key] = Array.isArray(existing) ? existing.concat(value) : [existing, value];
          continue;
        }

        summary[key] = value;
      }

      return summary;
    }

    function getCurrentStepId() {
      const visibleStepIds = getVisibleStepIds();
      return visibleStepIds[currentStepIndex] || "";
    }

    function getDiagnosticsEndpoint() {
      if (!apiEndpoint) {
        return "";
      }

      try {
        const url = new URL(apiEndpoint, window.location.origin);
        url.pathname = url.pathname.replace(
          /\/application-submit$/,
          "/application-client-log",
        );
        url.search = "";
        url.hash = "";
        return url.toString();
      } catch {
        return "";
      }
    }

    function getPrepareUploadsEndpoint() {
      return apiEndpoint;
    }

    function buildClientDiagnosticContext() {
      const fileInputs = [...form.querySelectorAll('input[type="file"]')];

      return {
        attemptId: currentSubmissionAttemptId,
        accountType: getAccountType(),
        selectedState:
          (form.elements.namedItem("hs_state_code").value || "").trim().toUpperCase(),
        currentStepId: getCurrentStepId(),
        currentStepIndex,
        visibleStepCount: getVisibleStepIds().length,
        pageUrl: window.location.href,
        apiEndpoint,
        diagnosticsEndpoint: getDiagnosticsEndpoint(),
        turnstileEnabled: isTurnstileEnabled(),
        hasTurnstileToken: Boolean(getTurnstileToken()),
        online:
          typeof navigator.onLine === "boolean" ? navigator.onLine : null,
        userAgent: navigator.userAgent,
        language: navigator.language || "",
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        fileInputs: fileInputs
          .filter((input) => input.files && input.files.length > 0)
          .map((input) => ({
            fieldName: input.name,
            fileCount: input.files.length,
            files: [...input.files].map((file) => ({
              size: file.size,
              type: file.type,
            })),
          })),
      };
    }

    async function reportClientDiagnostic(eventType, details) {
      const diagnosticsEndpoint = getDiagnosticsEndpoint();

      if (!diagnosticsEndpoint) {
        return;
      }

      const payload = {
        eventType,
        occurredAt: new Date().toISOString(),
        context: buildClientDiagnosticContext(),
        details,
      };

      try {
        const body = JSON.stringify(payload);

        if (
          navigator.sendBeacon &&
          typeof Blob !== "undefined"
        ) {
          const blob = new Blob([body], { type: "application/json" });
          navigator.sendBeacon(diagnosticsEndpoint, blob);
          return;
        }

        await fetch(diagnosticsEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body,
          keepalive: true,
        });
      } catch (diagnosticError) {
        if (debugMode) {
          console.group("Green Envee diagnostic report error");
          console.error(diagnosticError);
          console.groupEnd();
        }
      }
    }

    function setSubmittingState(isSubmitting) {
      submitButton.disabled = isSubmitting;
      submitButton.setAttribute("aria-busy", String(isSubmitting));
      nextButton.disabled = isSubmitting;
      backButton.disabled = isSubmitting || currentStepIndex === 0;

      if (submitStatus) {
        submitStatus.classList.toggle("ge-is-hidden", !isSubmitting);
      }
    }

    function isTurnstileEnabled() {
      return Boolean(turnstileSiteKey && turnstileContainer && turnstileWrapper);
    }

    async function renderTurnstileWidget() {
      if (!isTurnstileEnabled() || turnstileWidgetId !== null || turnstileLoadFailed) {
        return;
      }

      try {
        const turnstile = await ensureTurnstileApi();

        turnstileWidgetId = turnstile.render(turnstileContainer, {
          sitekey: turnstileSiteKey,
          callback: () => {
            if (
              feedback.textContent === "Please complete the spam protection check." ||
              feedback.textContent === "Spam protection expired. Please verify again." ||
              feedback.textContent === "Spam protection could not load. Please refresh and try again."
            ) {
              setFeedback("");
            }
          },
          "expired-callback": () => {
            setFeedback("Spam protection expired. Please verify again.");
            turnstile.reset(turnstileWidgetId);
          },
          "error-callback": () => {
            setFeedback("Spam protection could not load. Please refresh and try again.");
          },
        });
      } catch (error) {
        void reportClientDiagnostic("turnstile_load_error", {
          errorName: error && error.name ? error.name : "Error",
          errorMessage: error && error.message ? error.message : String(error),
        });
        turnstileLoadFailed = true;
        setFeedback("Spam protection could not load. Please refresh and try again.");

        if (debugMode) {
          console.group("Green Envee turnstile error");
          console.error(error);
          console.groupEnd();
        }
      }
    }

    function resetTurnstileWidget() {
      if (!window.turnstile || turnstileWidgetId === null) {
        return;
      }

      window.turnstile.reset(turnstileWidgetId);
    }

    function getTurnstileToken() {
      const field = form.querySelector('input[name="cf-turnstile-response"]');
      return field && typeof field.value === "string" ? field.value.trim() : "";
    }

    function getActiveFileInputs() {
      return [...form.querySelectorAll('input[type="file"]')].filter(
        (input) =>
          !input.disabled &&
          input.files &&
          input.files.length > 0,
      );
    }

    function getSelectedUploadFiles() {
      return getActiveFileInputs().map((input) => {
        const [file] = input.files;

        return {
          fieldName: input.name,
          file,
        };
      });
    }

    function validateSelectedFiles(selectedFiles) {
      for (const entry of selectedFiles) {
        if (entry.file.size > MAX_FILE_SIZE_BYTES) {
          setFeedback(`${getFieldLabel(entry.fieldName)}: file exceeds the 20 MB limit.`);
          return false;
        }
      }

      return true;
    }

    function buildPrepareUploadsPayload(selectedFiles) {
      return {
        mode: "prepare-uploads",
        attemptId: currentSubmissionAttemptId,
        branch: getAccountType(),
        accountType: getAccountType(),
        selectedState:
          (form.elements.namedItem("hs_state_code").value || "").trim().toUpperCase(),
        turnstileToken: getTurnstileToken(),
        files: selectedFiles.map(({ fieldName, file }) => ({
          fieldName,
          name: file.name,
          size: file.size,
          type: file.type,
        })),
      };
    }

    async function prepareUploads(selectedFiles) {
      const response = await fetch(getPrepareUploadsEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildPrepareUploadsPayload(selectedFiles)),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload || !payload.ok || !payload.uploadPreparation) {
        void reportClientDiagnostic("upload_prepare_error", {
          httpStatus: response.status,
          payload,
        });
        renderServerErrors((payload && payload.errors) || {});
        const error = new Error("Upload preparation failed.");
        error.userMessageHandled = true;
        throw error;
      }

      return payload.uploadPreparation;
    }

    async function uploadPreparedFiles(selectedFiles, uploadPreparation) {
      const uploadedFiles = {};

      for (const entry of selectedFiles) {
        const uploadTarget = uploadPreparation.uploads[entry.fieldName];

        if (!uploadTarget || !uploadTarget.uploadUrl) {
          throw new Error(`Missing upload target for ${entry.fieldName}.`);
        }

        const uploadResponse = await fetch(uploadTarget.uploadUrl, {
          method: "PUT",
          headers: entry.file.type
            ? {
                "Content-Type": entry.file.type,
              }
            : undefined,
          body: entry.file,
        });

        if (!uploadResponse.ok) {
          void reportClientDiagnostic("direct_upload_error", {
            fieldName: entry.fieldName,
            httpStatus: uploadResponse.status,
            uploadUrl: uploadTarget.uploadUrl,
          });
          throw new Error(`Direct upload failed for ${entry.fieldName}.`);
        }

        uploadedFiles[entry.fieldName] = {
          objectKey: uploadTarget.objectKey,
          name: entry.file.name,
          size: entry.file.size,
          type: entry.file.type,
        };
      }

      return uploadedFiles;
    }

    function buildSubmissionPayload(formData, uploadedFiles, uploadSessionToken) {
      const values = {};

      for (const [key, value] of formData.entries()) {
        if (value instanceof File || FILE_FIELD_NAMES.has(key)) {
          continue;
        }

        if (Object.prototype.hasOwnProperty.call(values, key)) {
          const existing = values[key];
          values[key] = Array.isArray(existing)
            ? existing.concat(value)
            : [existing, value];
          continue;
        }

        values[key] = value;
      }

      return {
        branch: getAccountType(),
        pageUrl: window.location.href,
        pageTitle: document.title,
        hutk: getCookieValue("hubspotutk"),
        submissionAttemptId: currentSubmissionAttemptId,
        uploadSessionToken,
        values,
        uploadedFiles,
      };
    }

    function getConditionalFields() {
      return [...form.querySelectorAll("[data-hide-accounts], [data-show-accounts]")];
    }

    function getFieldsFromContainer(container) {
      return [...container.querySelectorAll("input, select, textarea")];
    }

    function accountListContains(attributeValue, accountType) {
      return attributeValue
        .split(",")
        .map((value) => value.trim())
        .includes(accountType);
    }

    function updateConditionalFields() {
      const accountType = getAccountType();

      getConditionalFields().forEach((container) => {
        const hideAccounts = container.dataset.hideAccounts;
        const showAccounts = container.dataset.showAccounts;
        let shouldHide = false;

        if (hideAccounts && accountType) {
          shouldHide = accountListContains(hideAccounts, accountType);
        }

        if (showAccounts && accountType) {
          shouldHide = !accountListContains(showAccounts, accountType);
        }

        container.classList.toggle("ge-is-hidden-by-logic", shouldHide);

        getFieldsFromContainer(container).forEach((field) => {
          field.disabled = shouldHide;
          field.required = shouldHide ? false : field.dataset.wasRequired === "true";
        });
      });
    }

    function initializeRequiredFieldCache() {
      [...form.querySelectorAll("input, select, textarea")].forEach((field) => {
        field.dataset.wasRequired = field.required ? "true" : "false";
      });
    }

    function updateProgress(visibleStepIds) {
      const percent = ((currentStepIndex + 1) / visibleStepIds.length) * 100;
      const currentStepNumber = currentStepIndex + 1;
      const progressContainer = progressBar.parentElement;

      progressBar.style.width = `${percent}%`;
      progressContainer.setAttribute("aria-valuemax", String(visibleStepIds.length));
      progressContainer.setAttribute("aria-valuenow", String(currentStepNumber));
      progressContainer.setAttribute("aria-valuetext", `Step ${currentStepNumber} of ${visibleStepIds.length}`);
    }

    function updateStepUI() {
      const visibleStepIds = getVisibleStepIds();
      const isLastStep = currentStepIndex === visibleStepIds.length - 1;

      STEP_DEFINITIONS.forEach((stepDefinition) => {
        const step = steps.get(stepDefinition.id);
        const visibleIndex = visibleStepIds.indexOf(stepDefinition.id);
        const isVisible = visibleIndex !== -1;
        const isActive = visibleIndex === currentStepIndex;

        step.classList.toggle("ge-is-active", isVisible && isActive);
        step.classList.toggle("ge-is-hidden", !isVisible);
      });

      updateProgress(visibleStepIds);
      backButton.disabled = currentStepIndex === 0;
      backButton.classList.toggle("ge-is-invisible", currentStepIndex === 0);
      nextButton.classList.toggle("ge-is-hidden", isLastStep);
      submitButton.classList.toggle("ge-is-hidden", !isLastStep);

      if (turnstileWrapper) {
        turnstileWrapper.classList.toggle(
          "ge-is-hidden",
          !isLastStep || !isTurnstileEnabled(),
        );

        if (isLastStep && isTurnstileEnabled()) {
          void renderTurnstileWidget();
        }
      }
    }

    function renderDesignModePreview() {
      STEP_DEFINITIONS.forEach((stepDefinition, index) => {
        const step = steps.get(stepDefinition.id);

        if (!step) {
          return;
        }

        step.classList.toggle("ge-is-active", index === 0);
        step.classList.toggle("ge-is-hidden", index !== 0);
      });

      progressBar.style.width = `${100 / STEP_DEFINITIONS.length}%`;
      progressBar.parentElement.setAttribute("aria-valuemax", String(STEP_DEFINITIONS.length));
      progressBar.parentElement.setAttribute("aria-valuenow", "1");
      progressBar.parentElement.setAttribute(
        "aria-valuetext",
        `Step 1 of ${STEP_DEFINITIONS.length}`,
      );
      backButton.classList.add("ge-is-invisible");
      nextButton.classList.remove("ge-is-hidden");
      submitButton.classList.add("ge-is-hidden");
      setFeedback("Form interaction is disabled in the theme editor preview.");
    }

    function validateCurrentStep() {
      const visibleStepIds = getVisibleStepIds();
      const currentStep = steps.get(visibleStepIds[currentStepIndex]);
      const fields = [...currentStep.querySelectorAll("input, select, textarea")].filter(
        (field) =>
          !field.disabled &&
          field.type !== "hidden" &&
          field.offsetParent !== null &&
          field.willValidate,
      );

      let firstInvalidField = null;

      fields.forEach((field) => {
        field.setAttribute("aria-invalid", String(!field.checkValidity()));

        if (!field.checkValidity() && !firstInvalidField) {
          firstInvalidField = field;
        }
      });

      if (firstInvalidField) {
        setFeedback("Please complete the required fields before continuing.");
        firstInvalidField.reportValidity();
        firstInvalidField.focus();
        return false;
      }

      setFeedback("");
      return true;
    }

    function clampCurrentStepIndex() {
      const visibleStepIds = getVisibleStepIds();
      currentStepIndex = Math.min(currentStepIndex, visibleStepIds.length - 1);
    }

    if (isDesignMode) {
      renderDesignModePreview();
      return;
    }

    form.elements.namedItem("pro_website_account_applied_for").addEventListener("change", () => {
      currentStepIndex = 0;
      updateConditionalFields();
      clampCurrentStepIndex();
      updateStepUI();
      setFeedback("");
    });

    backButton.addEventListener("click", () => {
      if (currentStepIndex === 0) {
        return;
      }

      currentStepIndex -= 1;
      setFeedback("");
      updateStepUI();
    });

    nextButton.addEventListener("click", () => {
      if (!validateCurrentStep()) {
        return;
      }

      currentStepIndex += 1;
      updateStepUI();
    });

    form.addEventListener("input", (event) => {
      if (event.target.matches("input, select, textarea")) {
        event.target.setAttribute("aria-invalid", "false");
      }
    });

    form.addEventListener("blur", (event) => {
      const field = event.target;

      if (!(field instanceof HTMLInputElement) || field.type === "file") {
        return;
      }

      field.value = normalizeFormattedFieldValue(field.name, field.value);
    }, true);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      currentSubmissionAttemptId = createAttemptId();

      WHITESPACE_NORMALIZED_FIELD_NAMES.forEach((fieldName) => {
        const field = form.elements.namedItem(fieldName);

        if (field instanceof HTMLInputElement) {
          field.value = normalizeFormattedFieldValue(fieldName, field.value);
        }
      });

      const emailField = form.elements.namedItem("email");

      if (emailField instanceof HTMLInputElement) {
        emailField.value = normalizeFormattedFieldValue("email", emailField.value);
      }

      if (!validateCurrentStep()) {
        return;
      }

      if (!apiEndpoint) {
        setFeedback("Application API endpoint is not configured.");
        return;
      }

      if (isTurnstileEnabled()) {
        await renderTurnstileWidget();

        if (turnstileLoadFailed) {
          return;
        }

        if (!getTurnstileToken()) {
          setFeedback("Please complete the spam protection check.");
          return;
        }
      }

      const formData = new FormData(form);
      let submissionSucceeded = false;
      const selectedFiles = getSelectedUploadFiles();

      if (!validateSelectedFiles(selectedFiles)) {
        return;
      }

      if (debugMode) {
        console.group("Green Envee submission debug");
        console.log("Endpoint", apiEndpoint);
        console.log("Payload", summarizeFormData(formData));
        console.groupEnd();
      }

      setSubmittingState(true);
      setFeedback("Submitting application...", "ge-is-success");

      try {
        const uploadPreparation = await prepareUploads(selectedFiles);
        const uploadedFiles = await uploadPreparedFiles(
          selectedFiles,
          uploadPreparation,
        );
        const submissionPayload = buildSubmissionPayload(
          formData,
          uploadedFiles,
          uploadPreparation.uploadSessionToken,
        );

        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submissionPayload),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload || !payload.ok) {
          void reportClientDiagnostic("submission_response_error", {
            httpStatus: response.status,
            payload,
          });

          if (debugMode) {
            console.group("Green Envee submission error");
            console.log("Status", response.status);
            console.log("Response", payload);
            console.groupEnd();
          }

          renderServerErrors((payload && payload.errors) || {});
          return;
        }

        if (debugMode) {
          console.group("Green Envee submission success");
          console.log("Response", payload);
          console.groupEnd();
        }

        submissionSucceeded = true;
        handleSuccessfulSubmissionRedirect();
        return;
      } catch (error) {
        if (debugMode) {
          console.group("Green Envee network error");
          console.error(error);
          console.groupEnd();
        }

        void reportClientDiagnostic("submission_network_error", {
          errorName: error && error.name ? error.name : "Error",
          errorMessage: error && error.message ? error.message : String(error),
        });

        if (!error || !error.userMessageHandled) {
          setFeedback("Unable to submit right now. Please try again.");
        }
      } finally {
        if (isTurnstileEnabled() && !submissionSucceeded) {
          resetTurnstileWidget();
        }

        setSubmittingState(false);
      }
    });

    initializeRequiredFieldCache();
    updateConditionalFields();
    updateStepUI();
  }

  function initAllGreenEnveeForms(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-green-envee-form]").forEach(initGreenEnveeForm);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initAllGreenEnveeForms(document));
  } else {
    initAllGreenEnveeForms(document);
  }

  document.addEventListener("shopify:section:load", (event) => {
    initAllGreenEnveeForms(event.target);
  });
})();
