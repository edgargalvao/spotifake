import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";

const RegisterCard = ({ isOpen, onClose, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const watchPassword = watch("password", "");

  useEffect(() => {
    let strength = 0;
    if (watchPassword.length >= 6) strength++;
    if (/[a-z]/.test(watchPassword) && /[A-Z]/.test(watchPassword)) strength++;
    if (/\d/.test(watchPassword)) strength++;
    if (/[^a-zA-Z\d]/.test(watchPassword)) strength++;
    setPasswordStrength(strength);
  }, [watchPassword]);

  const getPasswordStrengthText = () => ["Muito fraca", "Fraca", "Regular", "Boa", "Forte"][passwordStrength] || "";

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      const res = await fetch("/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        onSuccess?.();
        onClose();
      } else {
        const err = await res.json();
        alert(err.message || "Erro ao registrar.");
      }
    } catch {
      alert("Erro de conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="modal"
        style={{
          background: "#1e1e1e",
          color: "#fff",
          padding: "2rem",
          borderRadius: "10px",
          width: "100%",
          maxWidth: "400px",
          position: "relative",
          boxShadow: "0 0 20px rgba(0,0,0,0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="close-btn"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            color: "#fff",
            fontSize: "14px",
            lineHeight: "1",
          }}
        >
          <FaTimes />
        </button>

        <h1 style={{ textAlign: "center", marginBottom: "1rem", fontSize: "24px" }}>
          Crie sua conta
        </h1>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Username */}
          <div className="input-field">
            <input
              type="text"
              placeholder="Usuário"
              {...register("username", {
                required: "Usuário é obrigatório",
                minLength: { value: 3, message: "Mínimo de 3 caracteres" },
                pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Apenas letras, números e _" }
              })}
            />
            <FaUser className="icon" style={{ fontSize: "14px" }} />
            {errors.username && <p className="error">{errors.username.message}</p>}
          </div>

          {/* Password */}
          <div className="input-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              {...register("password", {
                required: "Senha é obrigatória",
                minLength: { value: 6, message: "Mínimo de 6 caracteres" }
              })}
            />
            <FaLock className="icon" style={{ fontSize: "14px" }} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: "14px",
                padding: 0,
                cursor: "pointer"
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && <p className="error">{errors.password.message}</p>}

            {watchPassword && (
              <div style={{ marginTop: "0.5rem", fontSize: "12px", color: "#fff" }}>
                <div style={{ background: "#555", height: "6px", borderRadius: "4px", marginBottom: "4px" }}>
                  <div style={{
                    width: `${(passwordStrength / 4) * 100}%`,
                    height: "100%",
                    background: ["#aaa", "red", "orange", "gold", "limegreen"][passwordStrength],
                    borderRadius: "4px",
                    transition: "width 0.3s"
                  }} />
                </div>
                Força: {getPasswordStrengthText()}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              height: "40px",
              background: "#fff",
              border: "none",
              borderRadius: "40px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              marginTop: "10px",
              color: "#333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
          >
            {isLoading ? "Registrando..." : "Registrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterCard;
