import React, { useState, useEffect, useRef } from "react";
import { useCombobox } from "downshift";
import fuzzysort from "fuzzysort";
import styles from "./ComboBox.module.scss";
import clsx from "clsx";
import { LuChevronDown, LuX } from "react-icons/lu";
interface Asset {
  id: string;
  name: string;
  imageUrl: string;
}

interface ComboboxProps {
  assets: Asset[];
  value: string | null;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  onValueChange: (value: string) => void;
}

const Combobox: React.FC<ComboboxProps> = ({ assets, value, inputValue, onInputValueChange, onValueChange }) => {
  const [inputItems, setInputItems] = useState(assets);
  const [isFiltering, setIsFiltering] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFiltering && inputValue) {
      const results = fuzzysort.go(inputValue, assets, { key: "name" });
      setInputItems(results.map((result) => result.obj));
    } else {
      setInputItems(assets);
    }
  }, [assets, inputValue, isFiltering]);

  const { isOpen, getToggleButtonProps, getMenuProps, getInputProps, highlightedIndex, getItemProps, reset } =
    useCombobox({
      items: inputItems,
      itemToString: (item) => (item ? item.name : ""),
      inputValue,
      selectedItem: assets.find((item) => item.id === value) || null,
      defaultHighlightedIndex: -1,
      defaultIsOpen: false,
      onStateChange: ({ type, selectedItem: newSelectedItem, inputValue: newInputValue }) => {
        switch (type) {
          case useCombobox.stateChangeTypes.InputChange:
            setIsFiltering(true);
            onInputValueChange(newInputValue || "");
            break;
          case useCombobox.stateChangeTypes.InputKeyDownEnter:
          case useCombobox.stateChangeTypes.ItemClick:
            if (newSelectedItem) {
              setIsFiltering(false);
              onValueChange(newSelectedItem.id);
              onInputValueChange(newSelectedItem.name);
            }
            break;
          case useCombobox.stateChangeTypes.ToggleButtonClick:
          case useCombobox.stateChangeTypes.InputClick:
            if (!isOpen) {
              setIsFiltering(false);
              // Keep the selected item's name in the input
              const selectedItem = assets.find((item) => item.id === value);
              onInputValueChange(selectedItem?.name || "");
            }
            break;
        }
      },
    });

  return (
    <div className={styles.comboboxContainer}>
      {/* <label {...getLabelProps()}>Select Asset:</label> */}
      <div className={styles.comboboxInputContainer}>
        <input {...getInputProps()} className={styles.comboboxInput} placeholder="Search assets..." ref={ref} />
        <button
          type="button"
          onClick={() => {
            reset();
            onInputValueChange("");
            onValueChange("");
            ref.current?.focus();
          }}
          className={styles.comboboxClearButton}
          aria-label="clear selection"
        >
          <div className={styles.comboboxClearButtonIcon}>
            <LuX size={15} color="#666" />
          </div>
        </button>
        <button type="button" {...getToggleButtonProps()} className={styles.comboboxButton} aria-label="toggle menu">
          <div className={styles.comboboxButtonIcon}>
            <LuChevronDown size={15} color="#666" />
          </div>
        </button>
      </div>
      <ul
        {...getMenuProps()}
        className={clsx(styles.comboboxList, {
          [styles.comboboxListOpen]: isOpen,
        })}
      >
        {isOpen &&
          inputItems.map((item, index) => (
            <li
              key={item.id}
              {...getItemProps({ item, index })}
              className={`${styles.comboboxItem} ${highlightedIndex === index ? styles.comboboxItemHighlighted : ""}`}
            >
              <img src={item.imageUrl} alt={item.name} className={styles.comboboxItemImage} />
              {item.name}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Combobox;
