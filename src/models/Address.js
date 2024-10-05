import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  street: { 
    type: String, 
    required: [true, "A rua é obrigatória."],
    trim: true 
  },
  number: { 
    type: String, 
    required: [true, "O número é obrigatório."], 
    trim: true
  },
  complement: {
    type: String,
    trim: true,
    default: "",
    validate: {
      validator: function (v) {
        return v === "" || typeof v === "string";
      }
    }
  },
  district: { 
    type: String, 
    required: [true, "O bairro é obrigatório."], 
    trim: true 
  },
  city: { 
    type: String, 
    required: [true, "A cidade é obrigatória."],
    trim: true  
  },
  state: { 
    type: String, 
    required: [true, "O estado é obrigatório."], 
    trim: true,
    uppercase: true,
    minlength: [2, "O estado deve ter 2 caracteres."] 
  },
  postalCode: { 
    type: String, 
    required: [true, "O CEP é obrigatório."], 
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{5}-?\d{3}$/.test(v);
      },
      message: props => `${props.value} não é um CEP válido!`
    }
  }
});

const Address = mongoose.model("Address", addressSchema);

export default Address;