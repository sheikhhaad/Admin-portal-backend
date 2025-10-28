import { ConfigModel } from "../models/configModel.js";

export const getConfig = async (req, res) => {
  try {
    const config = await ConfigModel.getConfig();
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: "Error fetching config", error: error.message });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const result = await ConfigModel.updateConfig(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error updating config", error: error.message });
  }
};
