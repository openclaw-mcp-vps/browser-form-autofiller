(function () {
  const FLOATING_BUTTON_ID = "bfa-fill-button";

  function normalize(value) {
    return (value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");
  }

  function scoreContext(pageText) {
    const text = pageText.toLowerCase();
    const checks = [
      {
        type: "job_application",
        keywords: ["resume", "cover letter", "employment", "hiring", "position"]
      },
      {
        type: "grant_application",
        keywords: ["grant", "funding", "proposal", "impact statement"]
      },
      {
        type: "vendor_onboarding",
        keywords: ["vendor", "supplier", "w-9", "procurement", "invoice"]
      },
      {
        type: "loan_application",
        keywords: ["loan", "credit", "income", "borrower"]
      }
    ];

    let best = { type: "general", score: 0 };

    checks.forEach((candidate) => {
      const score = candidate.keywords.reduce((sum, keyword) => (text.includes(keyword) ? sum + 1 : sum), 0);
      if (score > best.score) {
        best = { type: candidate.type, score };
      }
    });

    return best.type;
  }

  function getLabel(field) {
    const id = field.id;
    if (id) {
      const label = document.querySelector(`label[for='${CSS.escape(id)}']`);
      if (label) {
        return label.textContent || "";
      }
    }

    if (field.closest("label")) {
      return field.closest("label").textContent || "";
    }

    return field.getAttribute("aria-label") || field.placeholder || field.name || "";
  }

  function bestValue(fieldMeta, profile, contextType) {
    const key = normalize(fieldMeta);
    const override = profile.contextOverrides?.[contextType] || {};

    const map = [
      { match: ["fullname", "name"], value: profile.name },
      { match: ["email", "mail"], value: profile.email },
      { match: ["phone", "mobile", "tel"], value: profile.phone },
      { match: ["location", "city", "state", "address"], value: profile.location },
      { match: ["headline", "title"], value: profile.headline },
      { match: ["summary", "bio", "coverletter", "statement"], value: override.summary || profile.summary },
      { match: ["salary", "compensation"], value: override.salaryExpectation || profile.salaryExpectation },
      { match: ["availability", "startdate"], value: override.availability || profile.availability },
      { match: ["linkedin"], value: profile.links?.linkedin },
      { match: ["portfolio", "website"], value: profile.links?.portfolio || profile.links?.website },
      { match: ["github"], value: profile.links?.github }
    ];

    for (const candidate of map) {
      if (candidate.match.some((item) => key.includes(item))) {
        return candidate.value || "";
      }
    }

    if (Array.isArray(profile.customFields)) {
      for (const customField of profile.customFields) {
        if (key.includes(normalize(customField.key))) {
          return customField.value;
        }
      }
    }

    return "";
  }

  function setFieldValue(field, value) {
    if (!value) return false;

    if (field.tagName === "SELECT") {
      const select = field;
      const options = Array.from(select.options || []);
      const matched = options.find((option) => normalize(option.textContent).includes(normalize(value)));
      if (matched) {
        select.value = matched.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
      return false;
    }

    if (field.type === "checkbox") {
      const shouldCheck = ["yes", "true", "1"].includes(normalize(value));
      field.checked = shouldCheck;
      field.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }

    field.value = value;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function getAllFillableFields() {
    return Array.from(
      document.querySelectorAll(
        "input:not([type='hidden']):not([type='submit']):not([type='button']), textarea, select"
      )
    ).filter((field) => !field.disabled && field.offsetParent !== null);
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.bottom = "18px";
    toast.style.right = "18px";
    toast.style.zIndex = "2147483647";
    toast.style.background = "#0f172a";
    toast.style.color = "#e2e8f0";
    toast.style.border = "1px solid #334155";
    toast.style.padding = "10px 14px";
    toast.style.borderRadius = "8px";
    toast.style.font = "12px/1.4 system-ui";
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 2200);
  }

  async function loadProfile() {
    const result = await chrome.storage.sync.get(["bfa_profile"]);
    return result.bfa_profile || null;
  }

  async function runAutofill() {
    const profile = await loadProfile();
    if (!profile) {
      showToast("No profile saved. Open extension popup first.");
      return;
    }

    const contextType = scoreContext(document.body.innerText.slice(0, 5000));
    const fields = getAllFillableFields();
    let filled = 0;

    fields.forEach((field) => {
      const meta = `${field.name} ${field.id} ${field.placeholder || ""} ${getLabel(field)}`;
      const value = bestValue(meta, profile, contextType);
      if (setFieldValue(field, value)) {
        filled += 1;
      }
    });

    showToast(`Filled ${filled} fields (${contextType.replace(/_/g, " ")})`);
    chrome.runtime.sendMessage({ type: "SET_BADGE", text: String(filled) });
  }

  function insertFloatingButton() {
    if (document.getElementById(FLOATING_BUTTON_ID)) return;

    const button = document.createElement("button");
    button.id = FLOATING_BUTTON_ID;
    button.textContent = "Smart Fill";
    button.style.position = "fixed";
    button.style.bottom = "18px";
    button.style.left = "18px";
    button.style.zIndex = "2147483647";
    button.style.background = "#0ea5e9";
    button.style.color = "#0f172a";
    button.style.border = "none";
    button.style.borderRadius = "10px";
    button.style.padding = "10px 14px";
    button.style.font = "600 12px/1.3 system-ui";
    button.style.cursor = "pointer";
    button.style.boxShadow = "0 4px 14px rgba(14,165,233,0.35)";

    button.addEventListener("click", (event) => {
      event.preventDefault();
      runAutofill();
    });

    document.body.appendChild(button);
  }

  insertFloatingButton();
})();
